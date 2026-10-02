import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { TimeLog } from '@/models/TimeLog';
import { Handover } from '@/models/Handover';
import { Setting } from '@/models/Setting';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Quản lý mới có quyền tính lương' }, { status: 403 });
    }

    const body = await req.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn ngày bắt đầu và kết thúc kỳ lương' }, { status: 400 });
    }

    const settings = (await Setting.findOne()) || {
      latePenaltyPerMinute: 2000,
      lateGraceMinutes: 10,
    };

    const users = await User.find({ status: 'ACTIVE' });
    const timeLogs = await TimeLog.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['COMPLETED', 'ADJUSTED'] },
    });

    // Find all handovers where cash shortage happened
    const handovers = await Handover.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const calculatedPayslips = users.map((user) => {
      const userLogs = timeLogs.filter((log) => log.userId.toString() === user._id.toString());
      const userHandovers = handovers.filter((h) => h.fromUserId.toString() === user._id.toString());

      let standardHours = 0;
      let nightHours = 0;
      let otHours = 0;
      let totalLateMinutes = 0;

      userLogs.forEach((log) => {
        standardHours += Number(log.standardHours) || 0;
        nightHours += Number(log.nightHours) || 0;
        otHours += Number(log.overtimeHours) || 0;
        if (log.lateMinutes && log.lateMinutes > (settings.lateGraceMinutes || 10)) {
          totalLateMinutes += log.lateMinutes;
        }
      });

      standardHours = Number(standardHours.toFixed(2));
      nightHours = Number(nightHours.toFixed(2));
      otHours = Number(otHours.toFixed(2));
      const totalHours = Number((standardHours + nightHours).toFixed(2));

      const hourlyRate = user.hourlyRate || 25000;
      const nightRate = user.nightRate || Math.round(hourlyRate * 1.3);

      const standardSalary = Math.round(standardHours * hourlyRate);
      const nightSalary = Math.round(nightHours * nightRate);
      const otSalary = Math.round(otHours * hourlyRate * 1.5);
      const baseSalary = user.baseSalary || 0;
      const allowance = user.allowance || 0;

      // Attendance bonus: If worked >= 100 hours with 0 late penalties, give bonus 500,000đ
      const attendanceBonus = totalHours >= 80 && totalLateMinutes === 0 ? 300000 : 0;

      // Deductions: Late penalty
      const latePenalty = totalLateMinutes * (settings.latePenaltyPerMinute || 2000);

      // Cash shortages deduction (sum of negative differences)
      let cashShortagePenalty = 0;
      userHandovers.forEach((h) => {
        if (h.cashAudit && h.cashAudit.difference < 0) {
          cashShortagePenalty += Math.abs(h.cashAudit.difference);
        }
      });

      const totalEarnings = standardSalary + nightSalary + otSalary + baseSalary + allowance + attendanceBonus;
      const totalDeductions = latePenalty + cashShortagePenalty;
      const netSalary = Math.max(0, totalEarnings - totalDeductions);

      return {
        userId: user._id,
        staffName: user.name,
        staffCode: user.code,
        role: user.role,
        phone: user.phone,
        totalHours,
        standardHours,
        nightHours,
        otHours,
        hourlyRate,
        nightRate,
        standardSalary,
        nightSalary,
        otSalary,
        baseSalary,
        allowance,
        attendanceBonus,
        latePenalty,
        cashShortagePenalty,
        totalEarnings,
        totalDeductions,
        netSalary,
        note: totalLateMinutes > 0 ? `Đi trễ tổng ${totalLateMinutes} phút` : '',
        isPaid: false,
      };
    });

    const totalAmount = calculatedPayslips.reduce((acc, curr) => acc + curr.netSalary, 0);

    return NextResponse.json({
      success: true,
      startDate,
      endDate,
      totalAmount,
      totalStaff: calculatedPayslips.length,
      payslips: calculatedPayslips,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
