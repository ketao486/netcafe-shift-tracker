'use client';

import React, { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { formatDateVN, formatTimeVN, formatVND } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  Clock,
  LogIn,
  LogOut,
  KeyRound,
  Wifi,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Sparkles,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any | null>(null);
  const [activeLog, setActiveLog] = useState<any | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check-in / out form state
  const [pin, setPin] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live timer for active shift
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [meRes, logsRes, schedRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/attendance'),
        fetch(`/api/schedules?date=${format(new Date(), 'yyyy-MM-dd')}`),
      ]);

      const meData = await meRes.json();
      const logsData = await logsRes.json();
      const schedData = await schedRes.json();

      if (meData.success) setUser(meData.user);
      if (logsData.success) {
        const active = logsData.logs.find((l: any) => l.status === 'ACTIVE');
        setActiveLog(active || null);
        setRecentLogs(logsData.logs.slice(0, 5));
      }
      if (schedData.success && meData.user) {
        const myToday = schedData.schedules.filter((s: any) => s.userId?._id === meData.user.id);
        setTodaySchedules(myToday);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Elapsed timer ticker
  useEffect(() => {
    if (!activeLog) {
      setElapsedTime('00:00:00');
      return;
    }

    const checkInDate = new Date(activeLog.checkInTime);
    const interval = setInterval(() => {
      const now = new Date();
      const totalSec = Math.max(0, differenceInSeconds(now, checkInDate));
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      setElapsedTime(
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLog]);

  const handleCheckIn = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin || user?.pin,
          note: note || 'Wi-Fi quán Cyber',
          method: pin ? 'PIN' : 'WIFI',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Check-in thất bại');
      }

      setMessage({ type: 'success', text: data.message });
      setPin('');
      setNote('');
      fetchStaffData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!confirm('Bạn có chắc chắn muốn CHECK-OUT kết thúc ca làm việc?')) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin || user?.pin,
          note,
          logId: activeLog?._id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Check-out thất bại');
      }

      setMessage({ type: 'success', text: data.message });
      setPin('');
      setNote('');
      fetchStaffData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Greeting & Active Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xl text-zinc-950 shadow-lg shadow-emerald-500/20">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-zinc-100">{user?.name}</h1>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {user?.code}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-zinc-400">
              <RoleBadge role={user?.role || 'CASHIER'} />
              <span>Đơn giá: <strong className="text-zinc-200">{formatVND(user?.hourlyRate || 25000)}/h</strong></span>
              <span>Đêm: <strong className="text-cyan-400">{formatVND(user?.nightRate || 35000)}/h</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-950 px-4 py-2.5 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Wi-Fi Quán: <strong className="text-emerald-400 font-mono">CYBERSHOP_STAFF_5G</strong></span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Kiosk Check-In / Check-Out Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider">
                Điểm Danh & Chấm Giờ Trực Ca (Kiosk)
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                activeLog
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {activeLog ? 'Đang Trong Ca Trực' : 'Chưa Vào Ca'}
            </span>
          </div>

          {activeLog ? (
            /* Active shift display & Check-out trigger */
            <div className="space-y-6">
              <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-center space-y-3">
                <span className="text-xs text-zinc-400 uppercase font-semibold">Thời Gian Trực Thực Tế</span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-wider">
                  {elapsedTime}
                </div>
                <div className="text-xs text-zinc-400 flex items-center justify-center space-x-4">
                  <span>
                    Bắt đầu lúc:{' '}
                    <strong className="text-zinc-200 font-mono">
                      {formatTimeVN(activeLog.checkInTime)}
                    </strong>
                  </span>
                  <span>
                    Ngày: <strong className="text-zinc-200">{formatDateVN(activeLog.date)}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-300">Ghi chú bàn giao / Check-out (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã vệ sinh quầy, bàn giao két cho bạn Hoa..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-400"
                />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckOut}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-zinc-950 font-black text-sm shadow-xl shadow-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span>{submitting ? 'Đang xử lý...' : 'KẾT THÚC CA LÀM (CHECK-OUT)'}</span>
              </button>
            </div>
          ) : (
            /* Ready to check-in */
            <div className="space-y-6">
              <div className="text-center space-y-2 py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                  <LogIn className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Bắt Đầu Ca Làm Việc</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Hệ thống tự động so khớp lịch ca hôm nay, nhận diện điểm danh đúng giờ hoặc phát hiện đi trễ.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-300">Xác thực mã PIN (Hoặc bấm Check-in trực tiếp)</label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Mã PIN (Mặc định tự nhận nếu đã đăng nhập)"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-amber-400 font-mono tracking-widest placeholder-zinc-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckIn}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>{submitting ? 'Đang điểm danh...' : 'BẮT ĐẦU CA LÀM (CHECK-IN)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Today's Schedules & Reminders */}
        <div className="space-y-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>Ca Trực Của Bạn Hôm Nay</span>
            </h3>

            {todaySchedules.length === 0 ? (
              <div className="text-xs text-zinc-400 py-4 text-center border border-dashed border-zinc-800 rounded-xl">
                Hôm nay bạn không có lịch xếp ca cố định.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedules.map((s) => (
                  <div key={s._id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-zinc-100">{s.shiftName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Vị trí: <strong className="text-zinc-300">{s.station}</strong></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Nhật Ký Điểm Danh Gần Đây
            </h3>

            {recentLogs.length === 0 ? (
              <div className="text-xs text-zinc-400 py-3 text-center">Chưa có bản ghi nào.</div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((l) => (
                  <div key={l._id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-zinc-200">{formatDateVN(l.date)}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {formatTimeVN(l.checkInTime)} - {l.checkOutTime ? formatTimeVN(l.checkOutTime) : '...'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-emerald-400 font-bold">{l.totalHours}h</div>
                      {l.nightHours > 0 && <div className="text-[10px] text-purple-400 font-mono">{l.nightHours}h đêm</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
