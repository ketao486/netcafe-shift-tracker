import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // Auto seed if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await seedDatabase();
    }

    const body = await req.json();
    const { username, password, pin, mode } = body;

    let user;

    if (mode === 'PIN' || (pin && !password)) {
      if (!pin) {
        return NextResponse.json({ success: false, message: 'Vui lòng nhập mã PIN' }, { status: 400 });
      }
      user = await User.findOne({ pin, status: 'ACTIVE' });
      if (!user) {
        return NextResponse.json({ success: false, message: 'Mã PIN không đúng hoặc tài khoản bị khóa' }, { status: 401 });
      }
    } else {
      if (!username || !password) {
        return NextResponse.json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' }, { status: 400 });
      }

      user = await User.findOne({
        $or: [{ username: username.toLowerCase().trim() }, { code: username.toUpperCase().trim() }],
        status: 'ACTIVE',
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa' }, { status: 401 });
      }

      const isValidPassword = comparePassword(password, user.password || '');
      if (!isValidPassword) {
        return NextResponse.json({ success: false, message: 'Mật khẩu không chính xác' }, { status: 401 });
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      code: user.code,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        code: user.code,
        name: user.name,
        role: user.role,
        phone: user.phone,
        hourlyRate: user.hourlyRate,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Lỗi server' }, { status: 500 });
  }
}
