import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TimeLog } from '@/models/TimeLog';
import { Schedule } from '@/models/Schedule';
import { User } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { format, differenceInMinutes, parse, isValid } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { pin, method, note, scheduleId, userId: explicitUserId } = body;

    let targetUser = currentUser;

    // If PIN is provided (kiosk mode) or not logged in
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

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Check if there is already an active check-in
    const activeLog = await TimeLog.findOne({
      userId: targetUser._id,
      status: 'ACTIVE',
    });

    if (activeLog) {
      return NextResponse.json({
        success: false,
        message: `Bạn đang có ca làm việc chưa check-out (bắt đầu lúc ${format(activeLog.checkInTime, 'HH:mm')})`,
        activeLog,
      }, { status: 400 });
    }

    // Find scheduled shift for today if not provided
    let targetSchedule = null;
    if (scheduleId) {
      targetSchedule = await Schedule.findById(scheduleId);
    } else {
      targetSchedule = await Schedule.findOne({
        userId: targetUser._id,
        date: todayStr,
        status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
      }).sort({ startTime: 1 });
    }

    const now = new Date();
    let lateMinutes = 0;

    if (targetSchedule) {
      const scheduledStart = parse(`${targetSchedule.date} ${targetSchedule.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      if (isValid(scheduledStart)) {
        const diff = differenceInMinutes(now, scheduledStart);
        if (diff > 0) {
          lateMinutes = diff;
        }
      }
      // Update schedule status to IN_PROGRESS
      targetSchedule.status = 'IN_PROGRESS';
      await targetSchedule.save();
    }

    const newLog = await TimeLog.create({
      userId: targetUser._id,
      scheduleId: targetSchedule ? targetSchedule._id : undefined,
      date: todayStr,
      checkInTime: now,
      checkInMethod: method || (pin ? 'PIN' : 'WIFI'),
      checkInNote: note || '',
      lateMinutes,
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      message: `Check-in thành công cho nhân viên ${targetUser.name} (${targetUser.code})`,
      log: newLog,
      lateMinutes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
