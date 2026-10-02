'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatDateVN, formatVND } from '@/lib/utils';
import {
  Receipt,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Wrench,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  X,
} from 'lucide-react';

const DEFAULT_FNB_ITEMS = [
  { itemId: 'item_1', itemName: 'Sting Dâu Đỏ', unit: 'Chai', initialQty: 48, importQty: 0, soldQty: 0, actualQty: 48 },
  { itemId: 'item_2', itemName: 'Bò Húc (RedBull)', unit: 'Lon', initialQty: 36, importQty: 0, soldQty: 0, actualQty: 36 },
  { itemId: 'item_3', itemName: 'Mì Tôm Trứng Xúc Xích', unit: 'Tô', initialQty: 50, importQty: 0, soldQty: 0, actualQty: 50 },
  { itemId: 'item_4', itemName: 'Cà Phê Muối / Đen đá', unit: 'Ly', initialQty: 40, importQty: 0, soldQty: 0, actualQty: 40 },
  { itemId: 'item_5', itemName: 'Thẻ Nạp Garena 50K', unit: 'Thẻ', initialQty: 20, importQty: 0, soldQty: 0, actualQty: 20 },
];

export default function StaffHandoverPage() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [peers, setPeers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'NEW' | 'LIST'>('NEW');

  // Form states
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    shiftName: 'Ca 1 (Sáng) - 06:00 đến 14:00',
    toUserId: '',
    generalNotes: '',
    openingCash: 1500000,
    netBillingRevenue: 2800000,
    fnbRevenue: 950000,
    actualCash: 5250000,
    expenses: [
      { amount: 0, reason: '', time: '' },
    ],
    stockAudit: DEFAULT_FNB_ITEMS,
    incidentLogs: [] as { machineNumber: string; issue: string; note: string }[],
    customerLostItems: [] as { itemDescription: string; seatOrArea: string }[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, hRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/handovers'),
        fetch('/api/users?status=ACTIVE'),
      ]);

      const meData = await meRes.json();
      const hData = await hRes.json();
      const usersData = await usersRes.json();

      if (meData.success) setUser(meData.user);
      if (hData.success) setHandovers(hData.handovers);
      if (usersData.success && meData.user) {
        const others = usersData.users.filter((u: any) => u._id !== meData.user.id);
        setPeers(others);
        if (others.length > 0 && !formData.toUserId) {
          setFormData((prev) => ({ ...prev, toUserId: others[0]._id }));
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
  }, []);

  // Cash calculations
  const totalExpenses = formData.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpectedCash =
    Number(formData.openingCash || 0) +
    Number(formData.netBillingRevenue || 0) +
    Number(formData.fnbRevenue || 0) -
    totalExpenses;
  const cashDifference = Number(formData.actualCash || 0) - totalExpectedCash;

  // Handlers for dynamic expense rows
  const addExpenseRow = () => {
    setFormData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { amount: 0, reason: '', time: '' }],
    }));
  };

  const removeExpenseRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index),
    }));
  };

  const updateExpense = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const next = [...prev.expenses];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, expenses: next };
    });
  };

  // Stock audit row update
  const updateStock = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const next = [...prev.stockAudit];
      next[index] = { ...next[index], [field]: Number(value) };
      return { ...prev, stockAudit: next };
    });
  };

  // Incident log rows
  const addIncident = () => {
    setFormData((prev) => ({
      ...prev,
      incidentLogs: [...prev.incidentLogs, { machineNumber: '', issue: '', note: '' }],
    }));
  };

  const removeIncident = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      incidentLogs: prev.incidentLogs.filter((_, i) => i !== index),
    }));
  };

  // Lost item rows
  const addLostItem = () => {
    setFormData((prev) => ({
      ...prev,
      customerLostItems: [...prev.customerLostItems, { itemDescription: '', seatOrArea: '' }],
    }));
  };

  const removeLostItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customerLostItems: prev.customerLostItems.filter((_, i) => i !== index),
    }));
  };

  const handleCreateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanExpenses = formData.expenses.filter((x) => x.amount > 0 && x.reason.trim());

      const res = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          shiftName: formData.shiftName,
          toUserId: formData.toUserId,
          generalNotes: formData.generalNotes,
          cashAudit: {
            openingCash: Number(formData.openingCash),
            netBillingRevenue: Number(formData.netBillingRevenue),
            fnbRevenue: Number(formData.fnbRevenue),
            expenses: cleanExpenses,
            actualCash: Number(formData.actualCash),
          },
          stockAudit: formData.stockAudit,
          incidentLogs: formData.incidentLogs.filter((x) => x.machineNumber),
          customerLostItems: formData.customerLostItems.filter((x) => x.itemDescription),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      alert('Tạo biên bản giao ca thành công! Ca tiếp theo sẽ kiểm tra và ký nhận.');
      setActiveTab('LIST');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo biên bản');
    }
  };

  const handleConfirmHandover = async (id: string, action: 'CONFIRM' | 'DISPUTE') => {
    const disputeReason =
      action === 'DISPUTE'
        ? prompt('Nhập lý do khiếu nại (ví dụ: thiếu 50,000đ tiền mặt, thiếu 2 chai sting):')
        : '';
    if (action === 'DISPUTE' && !disputeReason) return;

    try {
      const res = await fetch(`/api/handovers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, disputeReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi thao tác');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Quy Trình Giao Ca & Bàn Giao Tài Chính</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Lập biên bản đối soát két tiền mặt, doanh thu máy, kiểm kê đồ uống F&B và ký nhận giữa 2 ca trực
          </p>
        </div>

        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'NEW'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lập Biên Bản Mới
          </button>
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'LIST'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lịch Sử & Nhận Ca ({handovers.length})
          </button>
        </div>
      </div>

      {activeTab === 'NEW' ? (
        /* Create Handover Form */
        <form onSubmit={handleCreateHandover} className="space-y-6">
          {/* Section 0: Shift & Next staff */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Ngày Giao Ca</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Ca Trực Của Bạn</label>
                <select
                  value={formData.shiftName}
                  onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="Ca 1 (Sáng) - 06:00 đến 14:00">Ca 1 (Sáng) - 06:00 đến 14:00</option>
                  <option value="Ca 2 (Chiều) - 14:00 đến 22:00">Ca 2 (Chiều) - 14:00 đến 22:00</option>
                  <option value="Ca 3 (Đêm) - 22:00 đến 06:00">Ca 3 (Đêm) - 22:00 đến 06:00</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Bàn Giao Cho Nhân Viên Ca Sau *</label>
                <select
                  required
                  value={formData.toUserId}
                  onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  {peers.map((p) => (
                    <option key={p._id} value={p._id}>
                      [{p.code}] {p.name} - {p.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Cash register audit */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>1. Đối Soát Két Tiền Ca Trực</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">1. Tiền mặt bàn giao đầu ca (đ)</label>
                <input
                  type="number"
                  step={10000}
                  required
                  value={formData.openingCash}
                  onChange={(e) => setFormData({ ...formData, openingCash: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">2. Doanh thu nạp tài khoản net (đ)</label>
                <input
                  type="number"
                  step={10000}
                  required
                  value={formData.netBillingRevenue}
                  onChange={(e) => setFormData({ ...formData, netBillingRevenue: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">3. Doanh thu bán F&B / Thẻ Game (đ)</label>
                <input
                  type="number"
                  step={10000}
                  required
                  value={formData.fnbRevenue}
                  onChange={(e) => setFormData({ ...formData, fnbRevenue: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* Expenses list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">4. Các khoản chi tạm ứng / chi vặt trong ca</span>
                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm khoản chi</span>
                </button>
              </div>

              {formData.expenses.map((exp, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Số tiền chi (đ)"
                    value={exp.amount || ''}
                    onChange={(e) => updateExpense(idx, 'amount', Number(e.target.value))}
                    className="w-40 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Nội dung chi (ví dụ: mua đá lạnh, mua nước rửa kính...)"
                    value={exp.reason}
                    onChange={(e) => updateExpense(idx, 'reason', e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                  {formData.expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseRow(idx)}
                      className="p-2 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Final Cash counting & Difference */}
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-xs text-zinc-400 block">Két Tiền Lý Thuyết Cần Có</span>
                  <span className="font-mono font-bold text-lg text-zinc-200">
                    {formatVND(totalExpectedCash)}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">(Đầu ca + Thu Net + Thu F&B - Chi vặt)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">5. Tiền mặt thực tế đếm được cuối ca (đ) *</label>
                  <input
                    type="number"
                    step={10000}
                    required
                    value={formData.actualCash}
                    onChange={(e) => setFormData({ ...formData, actualCash: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 font-mono font-black"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-xs text-zinc-400 block">Chênh Lệch Thừa / Thiếu</span>
                  <span
                    className={`font-mono font-black text-base ${
                      cashDifference === 0
                        ? 'text-emerald-400'
                        : cashDifference < 0
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {cashDifference === 0
                      ? 'Khớp 100% (0 đ)'
                      : cashDifference < 0
                      ? `THIẾU HỤT ${formatVND(Math.abs(cashDifference))}`
                      : `THỪA ${formatVND(cashDifference)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: F&B Stock quick audit */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>2. Bảng Kiểm Kê Hàng Hóa & Đồ Uống Nhanh</span>
            </h2>

            <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Mặt Hàng</th>
                    <th className="py-3 px-3">Đơn Vị</th>
                    <th className="py-3 px-3">Đầu Ca</th>
                    <th className="py-3 px-3">Nhập Thêm</th>
                    <th className="py-3 px-3">Đã Bán Trong Ca</th>
                    <th className="py-3 px-3">Tồn Lý Thuyết</th>
                    <th className="py-3 px-3">Thực Đếm Cuối Ca</th>
                    <th className="py-3 px-3">Hao Hụt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {formData.stockAudit.map((item, idx) => {
                    const expected = item.initialQty + item.importQty - item.soldQty;
                    const diff = item.actualQty - expected;

                    return (
                      <tr key={item.itemId} className="hover:bg-zinc-950/40">
                        <td className="py-2.5 px-3 font-sans font-bold text-zinc-100">{item.itemName}</td>
                        <td className="py-2.5 px-3 font-sans text-zinc-400">{item.unit}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={item.initialQty}
                            onChange={(e) => updateStock(idx, 'initialQty', e.target.value)}
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-center text-zinc-200"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={item.importQty}
                            onChange={(e) => updateStock(idx, 'importQty', e.target.value)}
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-center text-cyan-400"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={item.soldQty}
                            onChange={(e) => updateStock(idx, 'soldQty', e.target.value)}
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-center text-rose-400"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-zinc-200">{expected}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={item.actualQty}
                            onChange={(e) => updateStock(idx, 'actualQty', e.target.value)}
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-center text-emerald-400 font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          {diff === 0 ? (
                            <span className="text-emerald-400">0</span>
                          ) : diff < 0 ? (
                            <span className="text-rose-400">Thiếu {Math.abs(diff)}</span>
                          ) : (
                            <span className="text-cyan-400">Thừa {diff}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Incidents & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Machine Hardware Incidents */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4" />
                  <span>3. Nhật Ký Máy Hỏng / Sự Cố</span>
                </span>
                <button
                  type="button"
                  onClick={addIncident}
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm máy hỏng</span>
                </button>
              </div>

              {formData.incidentLogs.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">Không có máy nào gặp sự cố trong ca.</p>
              ) : (
                formData.incidentLogs.map((inc, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Số máy (VIP-01...)"
                      value={inc.machineNumber}
                      onChange={(e) => {
                        const next = [...formData.incidentLogs];
                        next[i].machineNumber = e.target.value;
                        setFormData({ ...formData, incidentLogs: next });
                      }}
                      className="w-28 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300"
                    />
                    <input
                      type="text"
                      placeholder="Tình trạng (chuột liệt, tai nghe rè...)"
                      value={inc.issue}
                      onChange={(e) => {
                        const next = [...formData.incidentLogs];
                        next[i].issue = e.target.value;
                        setFormData({ ...formData, incidentLogs: next });
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeIncident(i)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Lost Items & Notes */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>4. Đồ Khách Bỏ Quên & Dặn Dò</span>
                </span>
                <button
                  type="button"
                  onClick={addLostItem}
                  className="text-xs text-purple-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm đồ quên</span>
                </button>
              </div>

              {formData.customerLostItems.map((lost, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Mô tả đồ (Cáp sạc, ví...)"
                    value={lost.itemDescription}
                    onChange={(e) => {
                      const next = [...formData.customerLostItems];
                      next[i].itemDescription = e.target.value;
                      setFormData({ ...formData, customerLostItems: next });
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                  <input
                    type="text"
                    placeholder="Vị trí nhặt (Máy 12...)"
                    value={lost.seatOrArea}
                    onChange={(e) => {
                      const next = [...formData.customerLostItems];
                      next[i].seatOrArea = e.target.value;
                      setFormData({ ...formData, customerLostItems: next });
                    }}
                    className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeLostItem(i)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-zinc-300">Ghi chú dặn dò ca sau</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã lau dọn sàn, tủ lạnh F&B đã cắm sạc..."
                  value={formData.generalNotes}
                  onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>HOÀN TẤT & GỬI BIÊN BẢN GIAO CA</span>
          </button>
        </form>
      ) : (
        /* Handover List & Confirmation */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Biên Bản Bàn Giao Liên Quan Đến Bạn</span>
          </h2>

          {handovers.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs">Chưa có biên bản giao ca nào.</div>
          ) : (
            <div className="space-y-4">
              {handovers.map((h) => {
                const isIncoming = h.toUserId?._id === user?.id;
                const isOutgoing = h.fromUserId?._id === user?.id;
                const isPending = h.status === 'PENDING_CONFIRMATION';

                return (
                  <div
                    key={h._id}
                    className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div>
                        <div className="font-bold text-sm text-zinc-100 flex items-center space-x-2">
                          <span>{h.shiftName}</span>
                          <span className="text-xs text-emerald-400 font-mono">({formatDateVN(h.date)})</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Người giao: <strong className="text-zinc-200">{h.fromUserId?.name}</strong> → Người nhận:{' '}
                          <strong className="text-zinc-200">{h.toUserId?.name || 'Chưa gán'}</strong>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                          h.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : h.status === 'DISPUTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {h.status === 'CONFIRMED' ? 'Đã Nhận Ca' : h.status === 'DISPUTED' ? 'Khiếu Nại' : 'Chờ Ký Nhận'}
                      </span>
                    </div>

                    {/* Summary figures */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-400 block text-[10px]">Doanh Thu Ca</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatVND((h.cashAudit?.netBillingRevenue || 0) + (h.cashAudit?.fnbRevenue || 0))}
                        </span>
                      </div>

                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-400 block text-[10px]">Tiền Thực Đếm</span>
                        <span className="font-mono font-bold text-zinc-100">
                          {formatVND(h.cashAudit?.actualCash || 0)}
                        </span>
                      </div>

                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-400 block text-[10px]">Chênh Lệch Két</span>
                        <span
                          className={`font-mono font-bold ${
                            h.cashAudit?.difference === 0
                              ? 'text-emerald-400'
                              : h.cashAudit?.difference < 0
                              ? 'text-rose-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {formatVND(h.cashAudit?.difference || 0)}
                        </span>
                      </div>

                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-400 block text-[10px]">Sự Cố Máy Trạm</span>
                        <span className="font-bold text-amber-400">{h.incidentLogs?.length || 0} máy</span>
                      </div>
                    </div>

                    {/* Incoming employee actions */}
                    {isIncoming && isPending && (
                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-semibold">
                          Hãy kiểm tra kỹ két tiền và đồ uống trước khi ký nhận ca!
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleConfirmHandover(h._id, 'DISPUTE')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition"
                          >
                            Khiếu Nại Chênh Lệch
                          </button>

                          <button
                            onClick={() => handleConfirmHandover(h._id, 'CONFIRM')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ký Nhận Bàn Giao Ca</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
