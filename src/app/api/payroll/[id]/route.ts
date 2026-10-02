import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PayrollCycle } from '@/models/Payroll';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cycle = await PayrollCycle.findById(id).populate('lockedBy', 'name code');
    if (!cycle) {
      return NextResponse.json({ success: false, message: 'Kỳ lương không tồn tại' }, { status: 404 });
    }

    if (currentUser.role !== 'ADMIN') {
      const mySlip = cycle.payslips.find((s) => s.userId.toString() === currentUser._id.toString());
      if (!mySlip) {
        return NextResponse.json({ success: false, message: 'Bạn không có phiếu lương trong kỳ này' }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        cycle: {
          _id: cycle._id,
          code: cycle.code,
          title: cycle.title,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          status: cycle.status,
          payslips: [mySlip],
        },
      });
    }

    return NextResponse.json({ success: true, cycle });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Chỉ Admin mới có quyền thao tác' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, payslipId } = body;

    const cycle = await PayrollCycle.findById(id);
    if (!cycle) {
      return NextResponse.json({ success: false, message: 'Kỳ lương không tồn tại' }, { status: 404 });
    }

    if (action === 'MARK_PAID_ALL') {
      cycle.status = 'PAID';
      cycle.payslips.forEach((p) => {
        p.isPaid = true;
        p.paidAt = new Date();
      });
      await cycle.save();
      return NextResponse.json({ success: true, message: 'Đã đánh dấu thanh toán toàn bộ kỳ lương' });
    }

    if (action === 'MARK_PAID_SINGLE' && payslipId) {
      const payslipsArray = cycle.payslips as any;
      const slip = payslipsArray.id ? payslipsArray.id(payslipId) : payslipsArray.find((p: any) => p._id?.toString() === payslipId);
      if (slip) {
        slip.isPaid = !slip.isPaid;
        slip.paidAt = slip.isPaid ? new Date() : undefined;
        await cycle.save();
      }
      return NextResponse.json({ success: true, message: 'Đã cập nhật trạng thái chi trả' });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
