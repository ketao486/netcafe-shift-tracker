import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        code: user.code,
        name: user.name,
        role: user.role,
        phone: user.phone,
        hourlyRate: user.hourlyRate,
        nightRate: user.nightRate,
        baseSalary: user.baseSalary,
        allowance: user.allowance,
        pin: user.pin,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
