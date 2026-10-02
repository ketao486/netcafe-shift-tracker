import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Handover } from '@/models/Handover';
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
    const status = searchParams.get('status');

    const filter: any = {};
    if (date) filter.date = date;
    if (status) filter.status = status;

    if (currentUser.role !== 'ADMIN') {
      filter.$or = [{ fromUserId: currentUser._id }, { toUserId: currentUser._id }];
    }

    const handovers = await Handover.find(filter)
      .populate('fromUserId', 'code name role')
      .populate('toUserId', 'code name role')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ success: true, handovers });
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
    const {
      date,
      shiftName,
      toUserId,
      cashAudit,
      stockAudit,
      incidentLogs,
      customerLostItems,
      generalNotes,
    } = body;

    if (!date || !shiftName) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn ngày và tên ca' }, { status: 400 });
    }

    // Compute cash audit calculations
    const openingCash = Number(cashAudit?.openingCash) || 0;
    const netBillingRevenue = Number(cashAudit?.netBillingRevenue) || 0;
    const fnbRevenue = Number(cashAudit?.fnbRevenue) || 0;
    const expenses = cashAudit?.expenses || [];

    const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
    const totalExpectedCash = openingCash + netBillingRevenue + fnbRevenue - totalExpenses;
    const actualCash = Number(cashAudit?.actualCash) || 0;
    const difference = actualCash - totalExpectedCash;

    // Process stock audit differences
    const processedStock = (stockAudit || []).map((item: any) => {
      const init = Number(item.initialQty) || 0;
      const imp = Number(item.importQty) || 0;
      const sold = Number(item.soldQty) || 0;
      const expected = init + imp - sold;
      const actual = Number(item.actualQty) || 0;
      return {
        ...item,
        initialQty: init,
        importQty: imp,
        soldQty: sold,
        expectedQty: expected,
        actualQty: actual,
        difference: actual - expected,
      };
    });

    const handover = await Handover.create({
      date,
      shiftName,
      fromUserId: currentUser._id,
      toUserId: toUserId || null,
      status: 'PENDING_CONFIRMATION',
      cashAudit: {
        openingCash,
        netBillingRevenue,
        fnbRevenue,
        expenses,
        totalExpenses,
        totalExpectedCash,
        actualCash,
        difference,
        cashBreakdown: cashAudit?.cashBreakdown || {},
      },
      stockAudit: processedStock,
      incidentLogs: incidentLogs || [],
      customerLostItems: customerLostItems || [],
      generalNotes: generalNotes || '',
    });

    return NextResponse.json({
      success: true,
      handover,
      message: 'Tạo biên bản giao ca thành công. Chờ ca tiếp theo xác nhận!',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
