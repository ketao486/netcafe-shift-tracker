import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Handover } from '@/models/Handover';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const handover = await Handover.findById(id)
      .populate('fromUserId', 'code name role phone')
      .populate('toUserId', 'code name role phone');

    if (!handover) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biên bản giao ca' }, { status: 404 });
    }

    return NextResponse.json({ success: true, handover });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, disputeReason, resolvedIncidentIndex } = body;

    const handover = await Handover.findById(id);
    if (!handover) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy biên bản giao ca' }, { status: 404 });
    }

    if (action === 'CONFIRM') {
      handover.toUserId = currentUser._id;
      handover.status = 'CONFIRMED';
      handover.confirmedAt = new Date();
      await handover.save();
      return NextResponse.json({ success: true, message: 'Đã ký nhận bàn giao ca thành công!', handover });
    }

    if (action === 'DISPUTE') {
      handover.toUserId = currentUser._id;
      handover.status = 'DISPUTED';
      handover.disputeReason = disputeReason || 'Có chênh lệch tiền/hàng chưa giải quyết';
      await handover.save();
      return NextResponse.json({ success: true, message: 'Đã khiếu nại bàn giao ca', handover });
    }

    if (action === 'RESOLVE_INCIDENT' && typeof resolvedIncidentIndex === 'number') {
      if (handover.incidentLogs && handover.incidentLogs[resolvedIncidentIndex]) {
        handover.incidentLogs[resolvedIncidentIndex].status = 'RESOLVED';
        await handover.save();
      }
      return NextResponse.json({ success: true, message: 'Đã cập nhật sự cố', handover });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
