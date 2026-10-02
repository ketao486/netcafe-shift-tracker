'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { formatDateVN, formatVND } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import * as XLSX from 'xlsx';
import {
  Calculator,
  Lock,
  Download,
  Printer,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  X,
  History,
} from 'lucide-react';

export default function AdminPayrollPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [cycleTitle, setCycleTitle] = useState<string>(`Bảng Lương Tháng ${format(today, 'MM/yyyy')}`);

  const [payslips, setPayslips] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lockedCycles, setLockedCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [viewingSlip, setViewingSlip] = useState<any | null>(null);

  const fetchCalculatedPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await res.json();
      if (data.success) {
        setPayslips(data.payslips);
        setTotalAmount(data.totalAmount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedCycles = async () => {
    try {
      const res = await fetch('/api/payroll');
      const data = await res.json();
      if (data.success) {
        setLockedCycles(data.cycles);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCalculatedPayroll();
    fetchLockedCycles();
  }, [startDate, endDate]);

  const handleLockCycle = async () => {
    if (!confirm(`Bạn có chắc chắn muốn KHÓA SỔ kỳ lương "${cycleTitle}"? Sau khi khóa, dữ liệu sẽ được đóng băng.`)) {
      return;
    }

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cycleTitle,
          startDate,
          endDate,
          payslips,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Khóa sổ kỳ lương thành công!');
        fetchLockedCycles();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi khóa sổ');
    }
  };

  const handleExportExcel = () => {
    const listToExport = selectedCycle ? selectedCycle.payslips : payslips;
    const reportTitle = selectedCycle ? selectedCycle.title : cycleTitle;

    const exportRows = listToExport.map((p: any, idx: number) => ({
      STT: idx + 1,
      'Mã NV': p.staffCode,
      'Họ và Tên': p.staffName,
      'Vị Trí': p.role,
      'Số ĐT': p.phone || '',
      'Giờ Thường (h)': p.standardHours,
      'Đơn Giá Giờ (đ)': p.hourlyRate,
      'Lương Giờ Thường (đ)': p.standardSalary,
      'Giờ Đêm 22h-6h (h)': p.nightHours,
      'Đơn Giá Đêm (đ)': p.nightRate,
      'Lương Ca Đêm (đ)': p.nightSalary,
      'Tăng Ca OT (h)': p.otHours,
      'Lương OT (đ)': p.otSalary,
      'Lương Cứng (đ)': p.baseSalary,
      'Phụ Cấp (đ)': p.allowance,
      'Thưởng Chuyên Cần (đ)': p.attendanceBonus,
      'Phạt Đi Muộn (đ)': p.latePenalty,
      'Phạt Hụt Két (đ)': p.cashShortagePenalty,
      'Tổng Thu Nhập (đ)': p.totalEarnings,
      'Tổng Khấu Trừ (đ)': p.totalDeductions,
      'THỰC LĨNH (NET) (đ)': p.netSalary,
      'Ghi Chú': p.note || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BangLuong');
    XLSX.writeFile(workbook, `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-rose-400" />
            <span>Tính Lương & Xuất Phiếu Tự Động (Payroll)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tổng = (Giờ thường &times; Đơn giá) + (Giờ đêm &times; Đơn giá đêm) + Phụ cấp/Thưởng &minus; (Phạt trễ + Hụt két)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-100 font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleLockCycle}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-rose-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Khóa Sổ Kỳ Lương</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Cycle Selector */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Tên Kỳ Lương</label>
            <input
              type="text"
              value={cycleTitle}
              onChange={(e) => setCycleTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Từ Ngày (Bắt Đầu)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Đến Ngày (Kết Thúc)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold"
            />
          </div>
        </div>

        {/* History of locked cycles tabs */}
        {lockedCycles.length > 0 && (
          <div className="pt-3 border-t border-zinc-800/80 flex items-center space-x-2 overflow-x-auto">
            <span className="text-xs text-zinc-400 font-bold uppercase shrink-0 flex items-center space-x-1">
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Kỳ đã khóa:</span>
            </span>

            <button
              onClick={() => setSelectedCycle(null)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                !selectedCycle ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Xem Tính Toán Trực Tiếp (Live)
            </button>

            {lockedCycles.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCycle(c)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 flex items-center space-x-1 ${
                  selectedCycle?._id === c._id
                    ? 'bg-purple-500 text-zinc-950'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Total Payout Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {selectedCycle ? `Kỳ Lương Đã Khóa: ${selectedCycle.title}` : `Dự Toán Chi Trả: ${cycleTitle}`}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-zinc-100 font-mono">
            {formatVND(selectedCycle ? selectedCycle.totalAmount : totalAmount)}
          </div>
          <p className="text-xs text-zinc-400">
            Tổng cộng cho {selectedCycle ? selectedCycle.payslips?.length : payslips.length} nhân sự
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewingSlip(selectedCycle ? selectedCycle.payslips[0] : payslips[0])}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Xem Mẫu Phiếu Lương</span>
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Nhân Viên</th>
                <th className="py-3.5 px-4">Vị Trí</th>
                <th className="py-3.5 px-4">Giờ Thường</th>
                <th className="py-3.5 px-4">Giờ Đêm (22h-6h)</th>
                <th className="py-3.5 px-4">Lương Cứng/Phụ Cấp</th>
                <th className="py-3.5 px-4">Thưởng Chuyên Cần</th>
                <th className="py-3.5 px-4">Khấu Trừ (Phạt/Hụt Két)</th>
                <th className="py-3.5 px-4">THỰC LĨNH (NET)</th>
                <th className="py-3.5 px-4 text-right">Phiếu Lương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-zinc-400">
                    Đang tính toán bảng lương tự động...
                  </td>
                </tr>
              ) : (selectedCycle ? selectedCycle.payslips : payslips).length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-zinc-400">
                    Không có dữ liệu công trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                (selectedCycle ? selectedCycle.payslips : payslips).map((slip: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100">{slip.staffName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">[{slip.staffCode}]</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={slip.role} />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-zinc-200">{slip.standardHours}h</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {formatVND(slip.standardSalary)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-purple-400">{slip.nightHours}h</div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        {formatVND(slip.nightSalary)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      <div>{formatVND(slip.baseSalary + slip.allowance)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      {slip.attendanceBonus > 0 ? `+${formatVND(slip.attendanceBonus)}` : '0 đ'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {slip.totalDeductions > 0 ? (
                        <span className="text-rose-400 font-bold">-{formatVND(slip.totalDeductions)}</span>
                      ) : (
                        <span className="text-zinc-400">0 đ</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-400 bg-emerald-500/5">
                      {formatVND(slip.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewingSlip(slip)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 border border-zinc-700 transition"
                        title="Xem chi tiết phiếu lương"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <span>Phiếu Lương Chi Tiết</span>
              </h2>
              <button
                onClick={() => setViewingSlip(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Card */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4 text-zinc-200">
              <div className="text-center border-b border-zinc-800 pb-3 space-y-1">
                <h3 className="font-black text-emerald-400 text-base">CYBER GAME CYBERSPACE PRO</h3>
                <p className="text-xs text-zinc-400">PHIẾU THANH TOÁN LƯƠNG NHÂN SỰ</p>
                <p className="text-[11px] text-zinc-400 font-mono">Kỳ: {selectedCycle ? selectedCycle.title : cycleTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Nhân viên: <strong>{viewingSlip.staffName}</strong></div>
                <div>Mã NV: <strong className="font-mono text-emerald-400">{viewingSlip.staffCode}</strong></div>
                <div>Vị trí: <strong>{viewingSlip.role}</strong></div>
                <div>Số ĐT: <strong className="font-mono">{viewingSlip.phone || 'N/A'}</strong></div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                <div className="flex justify-between font-mono">
                  <span>1. Lương giờ thường ({viewingSlip.standardHours}h &times; {formatVND(viewingSlip.hourlyRate)}):</span>
                  <span className="font-bold text-zinc-100">{formatVND(viewingSlip.standardSalary)}</span>
                </div>

                <div className="flex justify-between font-mono">
                  <span>2. Lương ca đêm 22h-6h ({viewingSlip.nightHours}h &times; {formatVND(viewingSlip.nightRate)}):</span>
                  <span className="font-bold text-purple-400">{formatVND(viewingSlip.nightSalary)}</span>
                </div>

                {viewingSlip.otSalary > 0 && (
                  <div className="flex justify-between font-mono">
                    <span>3. Lương tăng ca OT ({viewingSlip.otHours}h):</span>
                    <span className="font-bold text-rose-400">{formatVND(viewingSlip.otSalary)}</span>
                  </div>
                )}

                {viewingSlip.baseSalary > 0 && (
                  <div className="flex justify-between font-mono">
                    <span>4. Lương cứng cố định:</span>
                    <span className="font-bold text-zinc-100">{formatVND(viewingSlip.baseSalary)}</span>
                  </div>
                )}

                {viewingSlip.allowance > 0 && (
                  <div className="flex justify-between font-mono">
                    <span>5. Phụ cấp trách nhiệm / ăn ca:</span>
                    <span className="font-bold text-zinc-100">{formatVND(viewingSlip.allowance)}</span>
                  </div>
                )}

                {viewingSlip.attendanceBonus > 0 && (
                  <div className="flex justify-between font-mono text-emerald-400">
                    <span>6. Thưởng chuyên cần:</span>
                    <span className="font-bold">+{formatVND(viewingSlip.attendanceBonus)}</span>
                  </div>
                )}

                {viewingSlip.latePenalty > 0 && (
                  <div className="flex justify-between font-mono text-rose-400">
                    <span>7. Phạt đi muộn:</span>
                    <span className="font-bold">-{formatVND(viewingSlip.latePenalty)}</span>
                  </div>
                )}

                {viewingSlip.cashShortagePenalty > 0 && (
                  <div className="flex justify-between font-mono text-rose-400">
                    <span>8. Khấu trừ hụt két tiền bàn giao:</span>
                    <span className="font-bold">-{formatVND(viewingSlip.cashShortagePenalty)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                <span className="font-bold uppercase tracking-wider">THỰC LĨNH (NET):</span>
                <span className="font-black font-mono text-lg text-emerald-400">
                  {formatVND(viewingSlip.netSalary)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handlePrintSlip}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Lương</span>
              </button>

              <button
                onClick={() => setViewingSlip(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
