import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Schedule } from '@/models/Schedule';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền sửa ca' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await Schedule.findByIdAndUpdate(id, body, { new: true }).populate('userId', 'code name role');
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ca làm không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, schedule: updated, message: 'Cập nhật ca làm thành công' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền xóa ca' }, { status: 403 });
    }

    const { id } = await params;
    await Schedule.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Đã xóa ca làm' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
