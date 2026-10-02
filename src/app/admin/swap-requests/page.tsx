'use client';

import React, { useState, useEffect } from 'react';
import { formatDateVN } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function AdminSwapRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedules/swap');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleManagerAction = async (requestId: string, action: 'MANAGER_APPROVE' | 'MANAGER_REJECT') => {
    const note = prompt(
      action === 'MANAGER_APPROVE' ? 'Ghi chú duyệt (tùy chọn):' : 'Lý do từ chối (tùy chọn):',
      action === 'MANAGER_APPROVE' ? 'Đã duyệt ca' : 'Không duyệt'
    );
    if (note === null) return;

    try {
      const res = await fetch('/api/schedules/swap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          managerNote: note,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchRequests();
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi xử lý');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-purple-400" />
            <span>Duyệt Yêu Cầu Đổi Ca / Xin Nghỉ</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Xét duyệt các đơn đổi ca giữa 2 nhân viên hoặc đơn xin vắng ca trực. Tự động cập nhật lịch khi duyệt.
          </p>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Loại Đơn</th>
                <th className="py-3.5 px-4">Người Gửi Yêu Cầu</th>
                <th className="py-3.5 px-4">Ca Cần Đổi / Nghỉ</th>
                <th className="py-3.5 px-4">Đổi Với Nhân Viên</th>
                <th className="py-3.5 px-4">Lý Do</th>
                <th className="py-3.5 px-4">Đồng Nghiệp Ký</th>
                <th className="py-3.5 px-4">Trạng Thái Quản Lý</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-zinc-400">
                    Đang tải danh sách yêu cầu...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-zinc-400">
                    Hiện không có yêu cầu đổi ca hoặc xin nghỉ nào.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.type === 'SWAP'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {r.type === 'SWAP' ? 'ĐỔI CA' : 'XIN NGHỈ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100">{r.requesterId?.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">[{r.requesterId?.code}]</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-cyan-400 font-bold">
                        {r.requesterScheduleId ? `${r.requesterScheduleId.startTime} - ${r.requesterScheduleId.endTime}` : 'N/A'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {r.requesterScheduleId ? formatDateVN(r.requesterScheduleId.date) : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.targetUserId ? (
                        <>
                          <div className="font-bold text-zinc-200">{r.targetUserId.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">[{r.targetUserId.code}]</div>
                        </>
                      ) : (
                        <span className="text-zinc-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-zinc-300">
                      <div className="truncate" title={r.reason}>
                        {r.reason}
                      </div>
                      {r.managerNote && (
                        <div className="text-[10px] text-zinc-400 italic">Note: {r.managerNote}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.type === 'LEAVE' ? (
                        <span className="text-zinc-400">-</span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.peerStatus === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : r.peerStatus === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {r.peerStatus === 'ACCEPTED' ? 'Đã Đồng Ý' : r.peerStatus === 'REJECTED' ? 'Từ Chối' : 'Chờ Bạn Ký'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.managerStatus === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : r.managerStatus === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {r.managerStatus === 'APPROVED'
                          ? 'Đã Duyệt (Lịch Đã Đổi)'
                          : r.managerStatus === 'REJECTED'
                          ? 'Từ Chối'
                          : 'Chờ Quản Lý Duyệt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.managerStatus === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleManagerAction(r._id, 'MANAGER_APPROVE')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => handleManagerAction(r._id, 'MANAGER_REJECT')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ Chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
