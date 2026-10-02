import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TimeLog } from '@/models/TimeLog';
import { Schedule } from '@/models/Schedule';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { calculateWorkHours, calculateAttendanceDeviations } from '@/lib/utils';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { pin, note, logId, userId: explicitUserId } = body;

    let targetUser = currentUser;

    if (pin) {
      const userByPin = await User.findOne({ pin, status: 'ACTIVE' });
      if (!userByPin) {
        return NextResponse.json({ success: false, message: 'Mã PIN không đúng' }, { status: 401 });
      }
      targetUser = userByPin;
    } else if (explicitUserId && currentUser?.role === 'ADMIN') {
      targetUser = await User.findById(explicitUserId);
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập hoặc nhập mã PIN' }, { status: 401 });
    }

    let activeLog;
    if (logId) {
      activeLog = await TimeLog.findById(logId);
    } else {
      activeLog = await TimeLog.findOne({
        userId: targetUser._id,
        status: 'ACTIVE',
      }).sort({ checkInTime: -1 });
    }

    if (!activeLog) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy ca làm việc đang mở để check-out',
      }, { status: 400 });
    }

    const checkOutTime = new Date();
    const { totalHours, standardHours, nightHours } = calculateWorkHours(activeLog.checkInTime, checkOutTime);

    let earlyMinutes = 0;
    let overtimeHours = 0;

    if (activeLog.scheduleId) {
      const schedule = await Schedule.findById(activeLog.scheduleId);
      if (schedule) {
        const deviations = calculateAttendanceDeviations(
          activeLog.checkInTime,
          checkOutTime,
          schedule.date,
          schedule.startTime,
          schedule.endTime
        );
        earlyMinutes = deviations.earlyMinutes;

        // Compute scheduled duration (e.g. 8 hours)
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        let schedDurationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
        if (schedDurationHours < 0) schedDurationHours += 24;

        if (totalHours > schedDurationHours) {
          overtimeHours = Number((totalHours - schedDurationHours).toFixed(2));
        }

        schedule.status = 'COMPLETED';
        await schedule.save();
      }
    }

    activeLog.checkOutTime = checkOutTime;
    activeLog.checkOutNote = note || '';
    activeLog.totalHours = totalHours;
    activeLog.standardHours = standardHours;
    activeLog.nightHours = nightHours;
    activeLog.overtimeHours = overtimeHours;
    activeLog.earlyMinutes = earlyMinutes;
    activeLog.status = 'COMPLETED';

    await activeLog.save();

    return NextResponse.json({
      success: true,
      message: `Check-out thành công! Tổng giờ làm: ${totalHours}h (Giờ đêm: ${nightHours}h, Tăng ca: ${overtimeHours}h)`,
      log: activeLog,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
