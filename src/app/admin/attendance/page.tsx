'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { formatDateVN, formatDateTimeVN, formatTimeVN } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  Clock3,
  Search,
  Filter,
  Edit,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Flame,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminAttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [editingLog, setEditingLog] = useState<any | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    standardHours: 0,
    nightHours: 0,
    overtimeHours: 0,
    lateMinutes: 0,
    adjustedReason: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '/api/attendance?';
      if (selectedDate) url += `date=${selectedDate}&`;
      if (staffFilter) url += `userId=${staffFilter}&`;

      const [logsRes, staffRes] = await Promise.all([
        fetch(url),
        fetch('/api/users'),
      ]);

      const logsData = await logsRes.json();
      const staffData = await staffRes.json();

      if (logsData.success) setLogs(logsData.logs);
      if (staffData.success) setStaffList(staffData.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, staffFilter]);

  const openEditModal = (log: any) => {
    setEditingLog(log);
    setEditFormData({
      standardHours: log.standardHours || 0,
      nightHours: log.nightHours || 0,
      overtimeHours: log.overtimeHours || 0,
      lateMinutes: log.lateMinutes || 0,
      adjustedReason: log.adjustedReason || '',
    });
  };

  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: editingLog._id,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      setEditingLog(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  // Calculations for summary stats
  const totalStandardHours = logs.reduce((sum, l) => sum + (l.standardHours || 0), 0);
  const totalNightHours = logs.reduce((sum, l) => sum + (l.nightHours || 0), 0);
  const totalOtHours = logs.reduce((sum, l) => sum + (l.overtimeHours || 0), 0);
  const totalLateMinutes = logs.reduce((sum, l) => sum + (l.lateMinutes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <Clock3 className="w-6 h-6 text-cyan-400" />
            <span>Chấm Giờ & Điểm Danh (Timesheet)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ghi nhận giờ thực tế, bóc tách giờ tiêu chuẩn, giờ làm đêm (22h–6h) và tăng ca OT
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tổng Giờ Tiêu Chuẩn</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalStandardHours.toFixed(1)}h</div>
          <p className="text-[11px] text-zinc-400">Giờ làm ban ngày (06h - 22h)</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tổng Giờ Ca Đêm</span>
            <Moon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{totalNightHours.toFixed(1)}h</div>
          <p className="text-[11px] text-zinc-400">Khung 22h đêm đến 06h sáng</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Giờ Tăng Ca (OT)</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{totalOtHours.toFixed(1)}h</div>
          <p className="text-[11px] text-zinc-400">Vượt giờ quy định ca trực</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tổng Phút Đi Trễ</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{totalLateMinutes} phút</div>
          <p className="text-[11px] text-zinc-400">Căn cứ tính trừ phạt chuyên cần</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 shrink-0">Lọc ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline"
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 shrink-0">Nhân viên:</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="">Tất cả nhân sự</option>
            {staffList.map((st) => (
              <option key={st._id} value={st._id}>
                [{st.code}] {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Ngày & Nhân Viên</th>
                <th className="py-3.5 px-4">Vị Trí</th>
                <th className="py-3.5 px-4">Giờ Vào (Check-in)</th>
                <th className="py-3.5 px-4">Giờ Ra (Check-out)</th>
                <th className="py-3.5 px-4">Giờ Thường</th>
                <th className="py-3.5 px-4">Giờ Đêm (22h-6h)</th>
                <th className="py-3.5 px-4">Tăng Ca (OT)</th>
                <th className="py-3.5 px-4">Đi Muộn</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Điều Chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-zinc-400">
                    Đang tải nhật ký điểm danh...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-zinc-400">
                    Không có bản ghi điểm danh nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100">{log.userId?.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {formatDateVN(log.date)} • [{log.userId?.code}]
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={log.userId?.role || 'CASHIER'} />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-emerald-400 font-bold">
                        {formatTimeVN(log.checkInTime)}
                      </div>
                      <div className="text-[10px] text-zinc-400">{log.checkInMethod}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {log.checkOutTime ? (
                        <div className="text-cyan-400 font-bold">{formatTimeVN(log.checkOutTime)}</div>
                      ) : (
                        <span className="text-amber-400 italic">Đang trong ca</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                      {log.standardHours}h
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                      {log.nightHours}h
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-400">
                      {log.overtimeHours > 0 ? `+${log.overtimeHours}h` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {log.lateMinutes > 0 ? (
                        <span className="text-rose-400 font-bold">+{log.lateMinutes}p</span>
                      ) : (
                        <span className="text-emerald-400">0p</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'ADJUSTED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.status === 'COMPLETED'
                          ? 'Hoàn Thành'
                          : log.status === 'ADJUSTED'
                          ? 'Đã Điều Chỉnh'
                          : 'Đang Trực'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(log)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400 transition"
                        title="Điều chỉnh giờ công"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adjust TimeLog */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                <Clock3 className="w-5 h-5 text-emerald-400" />
                <span>Điều Chỉnh Giờ Công Thực Tế</span>
              </h2>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div>Nhân viên: <strong className="text-emerald-400">{editingLog.userId?.name} ({editingLog.userId?.code})</strong></div>
              <div>Ngày: <strong className="text-zinc-200">{formatDateVN(editingLog.date)}</strong></div>
            </div>

            <form onSubmit={handleUpdateLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Giờ Thường (h)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.standardHours}
                    onChange={(e) => setEditFormData({ ...editFormData, standardHours: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Giờ Ca Đêm 22h-6h (h)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.nightHours}
                    onChange={(e) => setEditFormData({ ...editFormData, nightHours: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-purple-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Tăng Ca OT (h)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.overtimeHours}
                    onChange={(e) => setEditFormData({ ...editFormData, overtimeHours: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Phút Đi Muộn (p)</label>
                  <input
                    type="number"
                    value={editFormData.lateMinutes}
                    onChange={(e) => setEditFormData({ ...editFormData, lateMinutes: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Lý Do Điều Chỉnh (Ghi chú bắt buộc)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhân viên quên bấm check-out, làm thêm 1h..."
                  value={editFormData.adjustedReason}
                  onChange={(e) => setEditFormData({ ...editFormData, adjustedReason: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                >
                  Xác Nhận Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
