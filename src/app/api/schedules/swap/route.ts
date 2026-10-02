import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ShiftSwapRequest } from '@/models/ShiftSwapRequest';
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
    const filter: any = {};

    if (currentUser.role !== 'ADMIN') {
      filter.$or = [{ requesterId: currentUser._id }, { targetUserId: currentUser._id }];
    }

    const status = searchParams.get('status');
    if (status) {
      filter.managerStatus = status;
    }

    const requests = await ShiftSwapRequest.find(filter)
      .populate('requesterId', 'code name role')
      .populate('targetUserId', 'code name role')
      .populate('requesterScheduleId')
      .populate('targetScheduleId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, requesterScheduleId, targetUserId, targetScheduleId, reason } = body;

    if (!requesterScheduleId || !reason) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn ca và nhập lý do' }, { status: 400 });
    }

    const newRequest = await ShiftSwapRequest.create({
      requesterId: currentUser._id,
      targetUserId: targetUserId || null,
      type: type || 'SWAP',
      requesterScheduleId,
      targetScheduleId: targetScheduleId || null,
      reason,
      peerStatus: type === 'LEAVE' || !targetUserId ? 'NA' : 'PENDING',
      managerStatus: 'PENDING',
    });

    return NextResponse.json({ success: true, request: newRequest, message: 'Đã gửi yêu cầu thành công' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action, managerNote } = body; // action: 'PEER_ACCEPT' | 'PEER_REJECT' | 'MANAGER_APPROVE' | 'MANAGER_REJECT'

    const swapReq = await ShiftSwapRequest.findById(requestId);
    if (!swapReq) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy yêu cầu' }, { status: 404 });
    }

    if (action === 'PEER_ACCEPT' || action === 'PEER_REJECT') {
      if (swapReq.targetUserId?.toString() !== currentUser._id.toString()) {
        return NextResponse.json({ success: false, message: 'Bạn không phải người nhận yêu cầu đổi ca' }, { status: 403 });
      }
      swapReq.peerStatus = action === 'PEER_ACCEPT' ? 'ACCEPTED' : 'REJECTED';
      await swapReq.save();
      return NextResponse.json({ success: true, message: 'Đã phản hồi yêu cầu đổi ca' });
    }

    if (action === 'MANAGER_APPROVE' || action === 'MANAGER_REJECT') {
      if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'Chỉ Quản lý mới có quyền duyệt' }, { status: 403 });
      }

      if (action === 'MANAGER_APPROVE') {
        swapReq.managerStatus = 'APPROVED';
        swapReq.managerNote = managerNote || 'Đã duyệt';

        // Auto execute schedule swap/leave
        if (swapReq.type === 'SWAP' && swapReq.targetScheduleId && swapReq.targetUserId) {
          // Swap staff for two schedules
          await Schedule.findByIdAndUpdate(swapReq.requesterScheduleId, { userId: swapReq.targetUserId, status: 'SWAPPED' });
          await Schedule.findByIdAndUpdate(swapReq.targetScheduleId, { userId: swapReq.requesterId, status: 'SWAPPED' });
        } else if (swapReq.type === 'SWAP' && swapReq.targetUserId) {
          // Transfer schedule to target user
          await Schedule.findByIdAndUpdate(swapReq.requesterScheduleId, { userId: swapReq.targetUserId, status: 'SWAPPED' });
        } else if (swapReq.type === 'LEAVE') {
          await Schedule.findByIdAndUpdate(swapReq.requesterScheduleId, { status: 'ABSENT' });
        }
      } else {
        swapReq.managerStatus = 'REJECTED';
        swapReq.managerNote = managerNote || 'Từ chối duyệt';
      }

      await swapReq.save();
      return NextResponse.json({ success: true, message: 'Đã cập nhật trạng thái duyệt' });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
