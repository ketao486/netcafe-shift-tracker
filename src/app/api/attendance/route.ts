import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TimeLog } from '@/models/TimeLog';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const filter: any = {};

    // Staff can only view their own logs unless admin
    if (currentUser.role !== 'ADMIN') {
      filter.userId = currentUser._id;
    } else if (userId) {
      filter.userId = userId;
    }

    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      filter.status = status;
    }

    const logs = await TimeLog.find(filter)
      .populate('userId', 'code name role hourlyRate nightRate phone')
      .populate('scheduleId')
      .sort({ date: -1, checkInTime: -1 });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền điều chỉnh giờ công' }, { status: 403 });
    }

    const body = await req.json();
    const { logId, standardHours, nightHours, overtimeHours, lateMinutes, adjustedReason } = body;

    if (!logId) {
      return NextResponse.json({ success: false, message: 'Thiếu mã log' }, { status: 400 });
    }

    const log = await TimeLog.findById(logId);
    if (!log) {
      return NextResponse.json({ success: false, message: 'Bản ghi không tồn tại' }, { status: 404 });
    }

    if (standardHours !== undefined) log.standardHours = Number(standardHours);
    if (nightHours !== undefined) log.nightHours = Number(nightHours);
    if (overtimeHours !== undefined) log.overtimeHours = Number(overtimeHours);
    if (lateMinutes !== undefined) log.lateMinutes = Number(lateMinutes);

    log.totalHours = Number((log.standardHours + log.nightHours).toFixed(2));
    log.status = 'ADJUSTED';
    log.adjustedBy = currentUser._id;
    log.adjustedReason = adjustedReason || 'Điều chỉnh bởi Quản lý';

    await log.save();

    return NextResponse.json({ success: true, message: 'Đã cập nhật giờ công', log });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
