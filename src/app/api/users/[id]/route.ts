import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, message: 'Nhân viên không tồn tại' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền sửa nhân viên' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, password, pin, role, hourlyRate, nightRate, baseSalary, allowance, status } = body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (password) updateData.password = hashPassword(password);
    if (pin) updateData.pin = pin;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (hourlyRate !== undefined) updateData.hourlyRate = Number(hourlyRate);
    if (nightRate !== undefined) updateData.nightRate = Number(nightRate);
    if (baseSalary !== undefined) updateData.baseSalary = Number(baseSalary);
    if (allowance !== undefined) updateData.allowance = Number(allowance);

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Nhân viên không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser, message: 'Cập nhật thành công' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền xóa' }, { status: 403 });
    }

    const { id } = await params;
    await User.findByIdAndUpdate(id, { status: 'INACTIVE' });
    return NextResponse.json({ success: true, message: 'Đã chuyển trạng thái nhân viên sang nghỉ việc' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
