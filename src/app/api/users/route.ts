import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password').sort({ role: 1, code: 1 });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền thêm nhân viên' }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, phone, username, password, pin, role, hourlyRate, nightRate, baseSalary, allowance, status } = body;

    if (!code || !name || !username || !password) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đủ mã NV, họ tên, username và mật khẩu' }, { status: 400 });
    }

    const existing = await User.findOne({
      $or: [{ code: code.toUpperCase().trim() }, { username: username.toLowerCase().trim() }],
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Mã nhân viên hoặc tên đăng nhập đã tồn tại' }, { status: 400 });
    }

    const newUser = await User.create({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      phone: phone || '',
      username: username.toLowerCase().trim(),
      password: hashPassword(password),
      pin: pin || '1234',
      role: role || 'CASHIER',
      status: status || 'ACTIVE',
      hourlyRate: Number(hourlyRate) || 25000,
      nightRate: Number(nightRate) || 35000,
      baseSalary: Number(baseSalary) || 0,
      allowance: Number(allowance) || 0,
    });

    return NextResponse.json({ success: true, user: newUser, message: 'Thêm nhân viên thành công' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
