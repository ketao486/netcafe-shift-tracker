import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Schedule } from '@/models/Schedule';
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

    const filter: any = {};
    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (userId) {
      filter.userId = userId;
    }

    const schedules = await Schedule.find(filter)
      .populate('userId', 'code name role phone hourlyRate nightRate')
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({ success: true, schedules });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền xếp ca' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, date, shiftType, shiftName, startTime, endTime, station, role, notes, repeatDays } = body;

    if (!userId || !date || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đủ thông tin ca làm' }, { status: 400 });
    }

    const createdSchedules = [];

    if (repeatDays && Array.isArray(repeatDays) && repeatDays.length > 0) {
      // Create for multiple dates
      for (const d of repeatDays) {
        const sched = await Schedule.create({
          userId,
          date: d,
          shiftType: shiftType || 'CUSTOM',
          shiftName: shiftName || `${startTime} - ${endTime}`,
          startTime,
          endTime,
          station: station || 'Quầy Thu Ngân',
          role: role || 'CASHIER',
          notes: notes || '',
        });
        createdSchedules.push(sched);
      }
    } else {
      const sched = await Schedule.create({
        userId,
        date,
        shiftType: shiftType || 'CUSTOM',
        shiftName: shiftName || `${startTime} - ${endTime}`,
        startTime,
        endTime,
        station: station || 'Quầy Thu Ngân',
        role: role || 'CASHIER',
        notes: notes || '',
      });
      createdSchedules.push(sched);
    }

    return NextResponse.json({ success: true, schedules: createdSchedules, message: 'Xếp ca thành công' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
