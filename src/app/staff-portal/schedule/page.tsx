'use client';

import React, { useState, useEffect } from 'react';
import { formatDateVN } from '@/lib/utils';
import {
  Calendar,
  ArrowLeftRight,
  UserCheck,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function StaffSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [peers, setPeers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    type: 'SWAP',
    targetUserId: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, schedRes, reqRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/schedules'),
        fetch('/api/schedules/swap'),
        fetch('/api/users?status=ACTIVE'),
      ]);

      const meData = await meRes.json();
      const schedData = await schedRes.json();
      const reqData = await reqRes.json();
      const usersData = await usersRes.json();

      if (meData.success) setUser(meData.user);
      if (schedData.success) {
        // filter user's schedules
        const myScheds = schedData.schedules.filter((s: any) => s.userId?._id === meData.user.id);
        setSchedules(myScheds);
      }
      if (reqData.success) setRequests(reqData.requests);
      if (usersData.success && meData.user) {
        const otherPeers = usersData.users.filter((u: any) => u._id !== meData.user.id && u.role !== 'ADMIN');
        setPeers(otherPeers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSwapModal = (sched: any) => {
    setSelectedSchedule(sched);
    setFormData({
      type: 'SWAP',
      targetUserId: peers.length > 0 ? peers[0]._id : '',
      reason: '',
    });
    setShowSwapModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    try {
      const res = await fetch('/api/schedules/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterScheduleId: selectedSchedule._id,
          type: formData.type,
          targetUserId: formData.type === 'SWAP' ? formData.targetUserId : undefined,
          reason: formData.reason,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      setShowSwapModal(false);
      fetchData();
      alert('Đã gửi yêu cầu thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi yêu cầu');
    }
  };

  const handlePeerAction = async (requestId: string, action: 'PEER_ACCEPT' | 'PEER_REJECT') => {
    try {
      const res = await fetch('/api/schedules/swap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <span>Lịch Làm Việc & Đổi Ca / Xin Nghỉ</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Theo dõi các ca trực được phân công và gửi yêu cầu đổi ca với đồng nghiệp khi có việc bận
        </p>
      </div>

      {/* My Assigned Shifts Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Danh Sách Ca Làm Của Bạn ({schedules.length})</span>
        </h2>

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-2xl">
            Bạn chưa được xếp ca nào trong danh sách.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ngày Làm Việc</th>
                  <th className="py-3 px-4">Tên Ca</th>
                  <th className="py-3 px-4">Khung Giờ</th>
                  <th className="py-3 px-4">Vị Trí Trực</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Đổi Ca / Xin Nghỉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {schedules.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-bold text-zinc-100">{formatDateVN(s.date)}</td>
                    <td className="py-3 px-4">{s.shiftName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {s.startTime} - {s.endTime}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{s.station}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'IN_PROGRESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : s.status === 'COMPLETED'
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === 'SCHEDULED' && (
                        <button
                          onClick={() => openSwapModal(s)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition text-xs font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>Gửi Yêu Cầu</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Requests History & Peer Approvals */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
          <ArrowLeftRight className="w-4 h-4 text-purple-400" />
          <span>Yêu Cầu Đổi Ca & Đơn Xin Nghỉ Của Bạn / Gửi Đến Bạn</span>
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs">Chưa có yêu cầu nào phát sinh.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const isTargetPeer = r.targetUserId?._id === user?.id;
              const isRequester = r.requesterId?._id === user?.id;

              return (
                <div
                  key={r._id}
                  className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          r.type === 'SWAP' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {r.type === 'SWAP' ? 'ĐỔI CA' : 'XIN NGHỈ'}
                      </span>
                      <span className="font-bold text-zinc-100">
                        {isRequester ? 'Bạn' : r.requesterId?.name}{' '}
                        {r.type === 'SWAP' ? `→ Đổi với ${isTargetPeer ? 'Bạn' : r.targetUserId?.name}` : 'xin nghỉ'}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      Ca: <span className="font-mono text-cyan-400">{r.requesterScheduleId?.startTime}-{r.requesterScheduleId?.endTime}</span> ngày {formatDateVN(r.requesterScheduleId?.date)}
                    </div>
                    <div className="text-zinc-400 italic">Lý do: &ldquo;{r.reason}&rdquo;</div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {/* If incoming swap request and not yet decided */}
                    {isTargetPeer && r.peerStatus === 'PENDING' && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handlePeerAction(r._id, 'PEER_ACCEPT')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                        >
                          Đồng Ý Nhận Ca
                        </button>
                        <button
                          onClick={() => handlePeerAction(r._id, 'PEER_REJECT')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold"
                        >
                          Từ Chối
                        </button>
                      </div>
                    )}

                    <div className="text-right space-y-1">
                      <div>
                        {r.type === 'SWAP' && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.peerStatus === 'ACCEPTED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : r.peerStatus === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            Đồng nghiệp: {r.peerStatus}
                          </span>
                        )}
                      </div>
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.managerStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : r.managerStatus === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          Quản lý: {r.managerStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Swap Modal */}
      {showSwapModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                <span>Gửi Đơn Đổi Ca / Xin Nghỉ</span>
              </h2>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1">
              <div className="text-zinc-400">Ca đã chọn:</div>
              <div className="font-bold text-zinc-100">
                {selectedSchedule.shiftName} ({selectedSchedule.startTime} - {selectedSchedule.endTime})
              </div>
              <div className="text-emerald-400 font-mono">Ngày: {formatDateVN(selectedSchedule.date)}</div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Loại Yêu Cầu</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                >
                  <option value="SWAP">Đổi ca trực với đồng nghiệp</option>
                  <option value="LEAVE">Xin vắng ca trực (Xin nghỉ)</option>
                </select>
              </div>

              {formData.type === 'SWAP' && (
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Chọn Đồng Nghiệp Nhận Đổi Ca</label>
                  <select
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100"
                  >
                    {peers.map((p) => (
                      <option key={p._id} value={p._id}>
                        [{p.code}] {p.name} - {p.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Lý Do Đổi Ca / Nghỉ *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Bận thi học kỳ, có việc gia đình đột xuất..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold shadow-lg shadow-purple-500/20"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
