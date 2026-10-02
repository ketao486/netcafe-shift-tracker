import React from 'react';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Schedule } from '@/models/Schedule';
import { TimeLog } from '@/models/TimeLog';
import { Handover } from '@/models/Handover';
import { ShiftSwapRequest } from '@/models/ShiftSwapRequest';
import { format } from 'date-fns';
import { formatVND, formatDateVN } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  Users,
  CalendarDays,
  Clock,
  Receipt,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  DollarSign,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await connectDB();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [
    totalActiveStaff,
    todaySchedules,
    activeTimeLogs,
    recentHandovers,
    pendingSwapRequests,
  ] = await Promise.all([
    User.countDocuments({ status: 'ACTIVE' }),
    Schedule.find({ date: todayStr }).populate('userId', 'code name role'),
    TimeLog.find({ status: 'ACTIVE' }).populate('userId', 'code name role'),
    Handover.find().populate('fromUserId', 'code name').populate('toUserId', 'code name').sort({ createdAt: -1 }).limit(5),
    ShiftSwapRequest.countDocuments({ managerStatus: 'PENDING' }),
  ]);

  // Total cash handled in recent handover
  const latestHandover = recentHandovers[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <span>Bảng Điều Khiển Quản Trị</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Hôm nay: <strong className="text-zinc-200">{formatDateVN(new Date())}</strong> — Giám sát vận hành phòng net 24/7
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/schedule"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Xếp Ca Mới</span>
          </Link>

          <Link
            href="/admin/payroll"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Bảng Lương</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Nhân Sự Đang Làm</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-100">{totalActiveStaff}</div>
          <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
            <span>Đang trực ca hiện tại:</span>
            <span className="text-emerald-400 font-bold">{activeTimeLogs.length} người</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Lịch Phân Ca Hôm Nay</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-100">{todaySchedules.length} ca</div>
          <div className="text-[11px] text-zinc-400 flex items-center space-x-1">
            <span>Bao gồm 3 ca trực chính</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Tiền Két Bàn Giao Gần Nhất</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {latestHandover?.cashAudit?.actualCash ? formatVND(latestHandover.cashAudit.actualCash) : '0 đ'}
          </div>
          <div className="text-[11px] text-zinc-400">
            Chênh lệch:{' '}
            <span className={latestHandover?.cashAudit?.difference < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {latestHandover ? formatVND(latestHandover.cashAudit?.difference || 0) : '0 đ'}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Yêu Cầu Đổi Ca / Nghỉ</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingSwapRequests}</div>
          <div className="text-[11px] text-zinc-400">
            <Link href="/admin/swap-requests" className="text-emerald-400 hover:underline flex items-center space-x-0.5">
              <span>Xem xét duyệt ngay</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Staff on Duty & Today's Shift Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Staff Currently Checked-in */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Nhân Viên Đang Trong Ca Trực ({activeTimeLogs.length})
              </h2>
            </div>
            <Link href="/admin/attendance" className="text-xs text-emerald-400 hover:underline flex items-center space-x-1">
              <span>Xem Timesheet</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeTimeLogs.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-xl">
              Hiện tại chưa có nhân viên nào check-in vào ca.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeTimeLogs.map((log: any) => (
                <div
                  key={log._id}
                  className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-zinc-100">{log.userId?.name}</span>
                      <RoleBadge role={log.userId?.role || 'CASHIER'} />
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center space-x-3">
                      <span>Check-in: <strong className="text-emerald-400 font-mono">{format(new Date(log.checkInTime), 'HH:mm:ss')}</strong></span>
                      <span>Phương thức: <span className="font-mono text-zinc-300">{log.checkInMethod}</span></span>
                    </div>
                  </div>

                  {log.lateMinutes > 0 ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      Trễ {log.lateMinutes}p
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Đúng giờ
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedules */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Lịch Phân Ca Hôm Nay ({todaySchedules.length})
              </h2>
            </div>
            <Link href="/admin/schedule" className="text-xs text-emerald-400 hover:underline flex items-center space-x-1">
              <span>Lưới 24h</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-xl">
              Chưa có lịch xếp ca cho ngày hôm nay.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedules.map((s: any) => (
                <div
                  key={s._id}
                  className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-zinc-100">{s.userId?.name}</span>
                      <span className="text-xs text-zinc-400">({s.station})</span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-semibold">{s.startTime} - {s.endTime}</span>
                      <span>•</span>
                      <span>{s.shiftName}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      s.status === 'IN_PROGRESS'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : s.status === 'COMPLETED'
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {s.status === 'IN_PROGRESS' ? 'Đang trực' : s.status === 'COMPLETED' ? 'Hoàn thành' : 'Sắp diễn ra'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Handover Reports */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Biên Bản Bàn Giao Ca & Đối Soát Két Gần Nhất
            </h2>
          </div>
          <Link href="/admin/handover" className="text-xs text-emerald-400 hover:underline flex items-center space-x-1">
            <span>Chi tiết bàn giao</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentHandovers.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs">Chưa có biên bản giao ca nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ngày & Ca Trực</th>
                  <th className="py-3 px-4">Người Giao</th>
                  <th className="py-3 px-4">Người Nhận</th>
                  <th className="py-3 px-4">Doanh Thu Két</th>
                  <th className="py-3 px-4">Chi Tạm Ứng</th>
                  <th className="py-3 px-4">Tiền Thực Đếm</th>
                  <th className="py-3 px-4">Chênh Lệch</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {recentHandovers.map((h: any) => (
                  <tr key={h._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-100">{formatDateVN(h.date)}</div>
                      <div className="text-[11px] text-zinc-400">{h.shiftName}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-200">{h.fromUserId?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-zinc-200">{h.toUserId?.name || 'Chờ xác nhận'}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {formatVND((h.cashAudit?.netBillingRevenue || 0) + (h.cashAudit?.fnbRevenue || 0))}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-400">
                      {formatVND(h.cashAudit?.totalExpenses || 0)}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-100 font-bold">
                      {formatVND(h.cashAudit?.actualCash || 0)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {h.cashAudit?.difference === 0 ? (
                        <span className="text-emerald-400">Khớp 0 đ</span>
                      ) : h.cashAudit?.difference < 0 ? (
                        <span className="text-rose-400">Thiếu {formatVND(Math.abs(h.cashAudit.difference))}</span>
                      ) : (
                        <span className="text-cyan-400">Thừa {formatVND(h.cashAudit.difference)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : h.status === 'DISPUTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {h.status === 'CONFIRMED' ? 'Đã Nhận Ca' : h.status === 'DISPUTED' ? 'Khiếu Nại' : 'Chờ Xác Nhận'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
