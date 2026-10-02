import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Setting } from '@/models/Setting';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        storeName: 'CYBER GAME CYBERSPACE PRO',
        storeAddress: '123 Đường Công Nghệ, Quận 1, TP.HCM',
        storePhone: '0901 234 567',
      });
    }
    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền cập nhật cấu hình' }, { status: 403 });
    }

    const body = await req.json();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, body, { new: true });
    }

    return NextResponse.json({ success: true, message: 'Cập nhật cấu hình thành công', setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
