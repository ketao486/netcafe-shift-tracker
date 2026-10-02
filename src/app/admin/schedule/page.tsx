'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { formatDateVN } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

const STATIONS = [
  'Quầy Thu Ngân 1',
  'Quầy Thu Ngân 2',
  'Khu Máy VIP / Stream',
  'Khu Máy Gaming Thường',
  'Kỹ Thuật Phần Cứng',
  'Vệ Sinh & Phục Vụ F&B',
];

const STANDARD_SHIFTS = [
  { type: 'CA1', name: 'Ca 1 (Sáng)', start: '06:00', end: '14:00', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  { type: 'CA2', name: 'Ca 2 (Chiều/Tối)', start: '14:00', end: '22:00', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' },
  { type: 'CA3', name: 'Ca 3 (Đêm 22h-06h)', start: '22:00', end: '06:00', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
];

export default function ShiftScheduleTimelinePage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [schedules, setSchedules] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Shift form state
  const [formData, setFormData] = useState({
    userId: '',
    date: selectedDate,
    shiftType: 'CA1',
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    startTime: '06:00',
    endTime: '14:00',
    station: 'Quầy Thu Ngân 1',
    role: 'CASHIER',
    notes: '',
    repeatDaysCount: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, staffRes] = await Promise.all([
        fetch(`/api/schedules?date=${selectedDate}`),
        fetch('/api/users?status=ACTIVE'),
      ]);

      const schedData = await schedRes.json();
      const staffData = await staffRes.json();

      if (schedData.success) setSchedules(schedData.schedules);
      if (staffData.success) {
        setStaffList(staffData.users);
        if (staffData.users.length > 0 && !formData.userId) {
          setFormData((prev) => ({
            ...prev,
            userId: staffData.users[0]._id,
            role: staffData.users[0].role,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const prev = subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(parseISO(selectedDate), 1);
    setSelectedDate(format(next, 'yyyy-MM-dd'));
  };

  const handleShiftTypeSelect = (shift: typeof STANDARD_SHIFTS[0]) => {
    setFormData((prev) => ({
      ...prev,
      shiftType: shift.type,
      shiftName: `${shift.name} - ${shift.start} đến ${shift.end}`,
      startTime: shift.start,
      endTime: shift.end,
    }));
  };

  const handleUserSelect = (userId: string) => {
    const u = staffList.find((x) => x._id === userId);
    setFormData((prev) => ({
      ...prev,
      userId,
      role: u ? u.role : 'CASHIER',
    }));
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const repeatDays = [];
      const baseDate = parseISO(selectedDate);
      for (let i = 0; i < Number(formData.repeatDaysCount); i++) {
        repeatDays.push(format(addDays(baseDate, i), 'yyyy-MM-dd'));
      }

      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          repeatDays,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xếp ca');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm này?')) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 24 Hours Array for Timeline Header
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper to calculate start & span columns in 24h grid
  const getGridPosition = (startTime: string, endTime: string) => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);

    const startCol = sH + sM / 60;
    let duration = eH + eM / 60 - startCol;
    if (duration <= 0) duration += 24; // Cross midnight

    return {
      left: `${(startCol / 24) * 100}%`,
      width: `${(duration / 24) * 100}%`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-emerald-400" />
            <span>Lưới Phân Ca 24h (Timeline Grid)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Trực quan hóa 24 cột giờ/ngày theo từng vai trò (Thu ngân, Phục vụ, Kỹ thuật, Lao công)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
              title="Hôm trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-emerald-400 px-2 focus:outline-none"
            />

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
              title="Hôm sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, date: selectedDate }));
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Xếp Ca Mới</span>
          </button>
        </div>
      </div>

      {/* Preset standard shift banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STANDARD_SHIFTS.map((s) => (
          <div key={s.type} className={`rounded-xl border p-3 flex items-center justify-between ${s.color}`}>
            <div>
              <div className="font-bold text-xs">{s.name}</div>
              <div className="text-[11px] font-mono opacity-80">{s.start} - {s.end}</div>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-950/60">
              8 Tiếng
            </span>
          </div>
        ))}
      </div>

      {/* 24h Visual Timeline Grid */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Hour headers */}
          <div className="grid grid-cols-24 border-b border-zinc-800 pb-2 text-[10px] text-zinc-400 font-mono text-center">
            {hours.map((h) => (
              <div key={h} className="border-r border-zinc-800/40 last:border-r-0">
                {h < 10 ? `0${h}` : h}h
              </div>
            ))}
          </div>

          {/* Grid Rows by Station */}
          <div className="space-y-4 pt-3">
            {STATIONS.map((station) => {
              const stationSchedules = schedules.filter((s) => s.station === station);

              return (
                <div key={station} className="space-y-1.5">
                  <div className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{station}</span>
                    <span className="text-[11px] font-normal text-zinc-400 font-mono">
                      ({stationSchedules.length} ca)
                    </span>
                  </div>

                  {/* 24-hour timeline bar container */}
                  <div className="relative h-14 bg-zinc-950/80 rounded-xl border border-zinc-800/80 overflow-hidden">
                    {/* Background hour grid vertical lines */}
                    <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className={`border-r ${
                            h >= 22 || h < 6 ? 'bg-purple-950/10 border-purple-900/20' : 'border-zinc-800/30'
                          } last:border-r-0`}
                        />
                      ))}
                    </div>

                    {/* Schedule blocks on timeline */}
                    {stationSchedules.map((s) => {
                      const pos = getGridPosition(s.startTime, s.endTime);
                      const isNight = s.shiftType === 'CA3' || s.startTime >= '22:00' || s.startTime < '06:00';

                      return (
                        <div
                          key={s._id}
                          style={{ left: pos.left, width: pos.width }}
                          className={`absolute top-1 bottom-1 rounded-lg border px-2 py-1 flex items-center justify-between shadow-lg transition hover:scale-101 hover:z-20 cursor-pointer ${
                            isNight
                              ? 'bg-purple-900/50 border-purple-500/60 text-purple-200'
                              : s.shiftType === 'CA2'
                              ? 'bg-cyan-900/50 border-cyan-500/60 text-cyan-200'
                              : 'bg-emerald-900/50 border-emerald-500/60 text-emerald-200'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <div className="font-bold text-[11px] leading-tight truncate">
                              {s.userId?.name || 'Chưa gán'}
                            </div>
                            <div className="text-[10px] font-mono opacity-80 truncate">
                              {s.startTime} - {s.endTime} ({s.userId?.code})
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShift(s._id);
                            }}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition"
                            title="Xóa ca"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shift List Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Danh Sách Ca Làm Ngày {formatDateVN(selectedDate)} ({schedules.length})</span>
        </h2>

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-zinc-800 rounded-xl">
            Chưa có ca làm nào được xếp cho ngày này. Hãy bấm &ldquo;Xếp Ca Mới&rdquo; để tạo ca!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Nhân Viên</th>
                  <th className="py-3 px-4">Vị Trí Trực</th>
                  <th className="py-3 px-4">Khung Giờ</th>
                  <th className="py-3 px-4">Loại Ca</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {schedules.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-100">{s.userId?.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{s.userId?.code} - {s.userId?.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-200">{s.station}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{s.startTime} - {s.endTime}</td>
                    <td className="py-3 px-4">{s.shiftName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'IN_PROGRESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : s.status === 'COMPLETED'
                            ? 'bg-zinc-800 text-zinc-400'
                            : s.status === 'SWAPPED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteShift(s._id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                <span>Xếp Ca Làm Việc Mới</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              {/* Shift Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Chọn Ca Định Sẵn Hoặc Tự Chỉnh</label>
                <div className="grid grid-cols-3 gap-2">
                  {STANDARD_SHIFTS.map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => handleShiftTypeSelect(s)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition ${
                        formData.shiftType === s.type
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>{s.name}</div>
                      <div className="text-[10px] font-mono opacity-70 font-normal">{s.start}-{s.end}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Nhân Viên Trực *</label>
                  <select
                    required
                    value={formData.userId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>
                        [{st.code}] {st.name} - {st.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Vị Trí / Khu Vực *</label>
                  <select
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    {STATIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Giờ Bắt Đầu *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Giờ Kết Thúc *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Ngày Bắt Đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Lặp Lại Số Ngày Liên Tiếp</label>
                  <select
                    value={formData.repeatDaysCount}
                    onChange={(e) => setFormData({ ...formData, repeatDaysCount: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    <option value={1}>Chỉ 1 ngày này</option>
                    <option value={3}>3 ngày liên tiếp</option>
                    <option value={7}>Cả tuần (7 ngày)</option>
                    <option value={14}>2 tuần (14 ngày)</option>
                    <option value={30}>1 tháng (30 ngày)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Ghi Chú Công Việc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trực quầy chính, kiểm tra F&B..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Lưu & Gán Ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
