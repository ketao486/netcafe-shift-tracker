import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PayrollCycle } from '@/models/Payroll';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role === 'ADMIN') {
      const cycles = await PayrollCycle.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, cycles });
    } else {
      // For staff: return only cycles that contain their payslip
      const cycles = await PayrollCycle.find({
        'payslips.userId': currentUser._id,
      }).sort({ createdAt: -1 });

      const filteredCycles = cycles.map((c) => {
        const mySlip = c.payslips.find((s) => s.userId.toString() === currentUser._id.toString());
        return {
          _id: c._id,
          code: c.code,
          title: c.title,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          createdAt: c.createdAt,
          payslip: mySlip,
        };
      });

      return NextResponse.json({ success: true, cycles: filteredCycles });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền chốt bảng lương' }, { status: 403 });
    }

    const body = await req.json();
    const { code, title, startDate, endDate, payslips } = body;

    if (!title || !startDate || !endDate || !payslips || !payslips.length) {
      return NextResponse.json({ success: false, message: 'Thiếu dữ liệu để chốt sổ lương' }, { status: 400 });
    }

    const generatedCode = code || `PAYROLL-${startDate.replace(/-/g, '')}-${endDate.replace(/-/g, '')}`;
    const totalAmount = payslips.reduce((acc: number, curr: any) => acc + Number(curr.netSalary || 0), 0);

    const newCycle = await PayrollCycle.create({
      code: generatedCode,
      title,
      startDate,
      endDate,
      status: 'LOCKED',
      totalAmount,
      totalStaff: payslips.length,
      payslips,
      lockedBy: currentUser._id,
      lockedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      cycle: newCycle,
      message: 'Khóa sổ kỳ lương thành công! Dữ liệu đã được lưu trữ cố định.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
