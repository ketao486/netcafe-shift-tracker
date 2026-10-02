'use client';

import React, { useState, useEffect } from 'react';
import { formatVND } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  DollarSign,
  KeyRound,
  Phone,
  Shield,
  Search,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface StaffUser {
  _id: string;
  code: string;
  name: string;
  phone: string;
  username: string;
  pin: string;
  role: 'ADMIN' | 'CASHIER' | 'SERVICE' | 'TECH' | 'CLEANER';
  status: 'ACTIVE' | 'INACTIVE';
  hourlyRate: number;
  nightRate: number;
  baseSalary: number;
  allowance: number;
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    username: '',
    password: '',
    pin: '1234',
    role: 'CASHIER',
    hourlyRate: 25000,
    nightRate: 35000,
    baseSalary: 0,
    allowance: 0,
    status: 'ACTIVE',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    const nextCode = `NV00${staffList.length + 1}`;
    setFormData({
      code: nextCode,
      name: '',
      phone: '',
      username: '',
      password: 'password123',
      pin: `${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'CASHIER',
      hourlyRate: 28000,
      nightRate: 38000,
      baseSalary: 0,
      allowance: 200000,
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setFormData({
      code: staff.code,
      name: staff.name,
      phone: staff.phone,
      username: staff.username,
      password: '',
      pin: staff.pin,
      role: staff.role,
      hourlyRate: staff.hourlyRate,
      nightRate: staff.nightRate,
      baseSalary: staff.baseSalary,
      allowance: staff.allowance,
      status: staff.status,
    });
    setShowModal(true);
  };

  const handleRoleChange = (selectedRole: string) => {
    let defHourly = 25000;
    let defNight = 35000;
    let defBase = 0;
    let defAllow = 150000;

    if (selectedRole === 'TECH') {
      defHourly = 35000;
      defNight = 48000;
      defBase = 2000000;
      defAllow = 300000;
    } else if (selectedRole === 'CASHIER') {
      defHourly = 28000;
      defNight = 38000;
      defAllow = 200000;
    } else if (selectedRole === 'ADMIN') {
      defHourly = 50000;
      defNight = 65000;
      defBase = 10000000;
      defAllow = 1000000;
    } else if (selectedRole === 'CLEANER') {
      defHourly = 24000;
      defNight = 32000;
      defAllow = 100000;
    }

    setFormData((prev) => ({
      ...prev,
      role: selectedRole as any,
      hourlyRate: defHourly,
      nightRate: defNight,
      baseSalary: defBase,
      allowance: defAllow,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingStaff) {
        res = await fetch(`/api/users/${editingStaff._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      setShowModal(false);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Lỗi thao tác');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchesRole = roleFilter ? s.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Quản Lý Hồ Sơ & Định Mức Lương</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cấu hình nhân sự, đơn giá theo giờ linh hoạt, hệ số phụ cấp đêm (22h–6h) và lương cơ bản
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV (NV001), số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="">Tất cả vị trí / vai trò</option>
            <option value="CASHIER">Thu Ngân</option>
            <option value="SERVICE">Phục Vụ</option>
            <option value="TECH">Kỹ Thuật</option>
            <option value="CLEANER">Lao Công</option>
            <option value="ADMIN">Quản Lý</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Mã & Họ Tên</th>
                <th className="py-3.5 px-4">Vị Trí</th>
                <th className="py-3.5 px-4">Đơn Giá Giờ Thường</th>
                <th className="py-3.5 px-4">Đơn Giá Ca Đêm (22h-6h)</th>
                <th className="py-3.5 px-4">Lương Cứng / Phụ Cấp</th>
                <th className="py-3.5 px-4">Mã PIN Kiosk</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-zinc-400">
                    Đang tải dữ liệu nhân viên...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-zinc-400">
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100 flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-mono">[{staff.code}]</span>
                        <span>{staff.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono flex items-center space-x-2 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-400 inline" />
                        <span>{staff.phone || 'Chưa có SĐT'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={staff.role} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {formatVND(staff.hourlyRate)}/h
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {formatVND(staff.nightRate)}/h
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-zinc-200">
                        {staff.baseSalary > 0 ? formatVND(staff.baseSalary) : '0 đ'} (cứng)
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        +{formatVND(staff.allowance)} (phụ cấp)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800 text-amber-400 font-bold tracking-widest text-xs">
                        {staff.pin}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {staff.status === 'ACTIVE' ? 'Đang Làm' : 'Nghỉ Việc'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 border border-zinc-700 transition"
                        title="Chỉnh sửa định mức lương"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Staff */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>{editingStaff ? 'Cập Nhật Hồ Sơ & Lương Nhân Viên' : 'Thêm Nhân Viên & Định Mức Lương'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Mã Nhân Viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Vị Trí / Vai Trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    <option value="CASHIER">Thu Ngân (Quầy)</option>
                    <option value="SERVICE">Phục Vụ (F&B / Vệ sinh máy)</option>
                    <option value="TECH">Kỹ Thuật (Phần cứng / Mạng)</option>
                    <option value="CLEANER">Lao Công</option>
                    <option value="ADMIN">Quản Lý Phòng Net</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Tên Đăng Nhập</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStaff}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    {editingStaff ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo *'}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Mã PIN Kiosk (4-6 số)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono tracking-widest font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Trạng Thái Làm Việc</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  >
                    <option value="ACTIVE">Đang Làm Việc (Active)</option>
                    <option value="INACTIVE">Nghỉ Việc (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Payroll Rates Section */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>Cấu Hình Định Mức Đơn Giá Lương (VND)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Đơn giá giờ thường (VND/h)</label>
                    <input
                      type="number"
                      step={1000}
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Đơn giá ca đêm 22h-6h (VND/h)</label>
                    <input
                      type="number"
                      step={1000}
                      value={formData.nightRate}
                      onChange={(e) => setFormData({ ...formData, nightRate: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Lương cứng cố định (VND/tháng)</label>
                    <input
                      type="number"
                      step={100000}
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Phụ cấp trách nhiệm / ăn ca (VND)</label>
                    <input
                      type="number"
                      step={50000}
                      value={formData.allowance}
                      onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  {editingStaff ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
