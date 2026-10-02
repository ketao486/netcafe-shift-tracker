'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { formatDateVN, formatVND } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  DollarSign,
  Calendar,
  Clock,
  Printer,
  FileSpreadsheet,
  Moon,
  Sun,
  AlertCircle,
  Gift,
  Flame,
} from 'lucide-react';

export default function StaffPayslipPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(today), 'yyyy-MM-dd'));

  const [payslip, setPayslip] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyPayroll = async () => {
    try {
      setLoading(true);
      const [payRes, logsRes] = await Promise.all([
        fetch('/api/payroll/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate }),
        }),
        fetch('/api/attendance'),
      ]);

      const payData = await payRes.json();
      const logsData = await logsRes.json();

      if (payData.success && payData.payslips?.length > 0) {
        setPayslip(payData.payslips[0]);
      } else {
        setPayslip(null);
      }

      if (logsData.success) {
        setLogs(logsData.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayroll();
  }, [startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Phiếu Lương & Chi Tiết Giờ Công Cá Nhân</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tra cứu chi tiết lương theo giờ, phụ cấp ca đêm (22h–6h), thưởng chuyên cần và các khoản khấu trừ
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>In Phiếu Lương</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 shrink-0">Từ ngày:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 shrink-0">Đến ngày:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono"
          />
        </div>
      </div>

      {payslip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payslip Breakdown Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">TỔNG THỰC LĨNH (NET SALARY)</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {formatVND(payslip.netSalary)}
                </div>
              </div>
              <div className="text-right">
                <RoleBadge role={payslip.role} />
                <div className="text-[11px] text-zinc-400 font-mono mt-1">{payslip.staffCode}</div>
              </div>
            </div>

            {/* Income Streams */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                1. Các Khoản Thu Nhập ({formatVND(payslip.totalEarnings)})
              </span>

              <div className="space-y-2 text-xs">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Lương giờ thường ({payslip.standardHours}h &times; {formatVND(payslip.hourlyRate)}/h)</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-100">{formatVND(payslip.standardSalary)}</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>Lương ca đêm 22h-6h ({payslip.nightHours}h &times; {formatVND(payslip.nightRate)}/h)</span>
                  </div>
                  <span className="font-mono font-bold text-purple-400">{formatVND(payslip.nightSalary)}</span>
                </div>

                {payslip.otSalary > 0 && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>Lương tăng ca OT ({payslip.otHours}h)</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400">{formatVND(payslip.otSalary)}</span>
                  </div>
                )}

                {(payslip.baseSalary > 0 || payslip.allowance > 0) && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                    <span>Lương cứng & Phụ cấp trách nhiệm / ăn ca</span>
                    <span className="font-mono font-bold text-zinc-100">
                      {formatVND(payslip.baseSalary + payslip.allowance)}
                    </span>
                  </div>
                )}

                {payslip.attendanceBonus > 0 && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-emerald-400" />
                      <span>Thưởng chuyên cần (Điểm danh chuẩn chỉ)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+{formatVND(payslip.attendanceBonus)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            {payslip.totalDeductions > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  2. Các Khoản Khấu Trừ (-{formatVND(payslip.totalDeductions)})
                </span>

                <div className="space-y-2 text-xs">
                  {payslip.latePenalty > 0 && (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Phạt đi muộn giờ ca trực ({payslip.totalLateMinutes} phút)</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400">-{formatVND(payslip.latePenalty)}</span>
                    </div>
                  )}

                  {payslip.cashShortagePenalty > 0 && (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Khấu trừ thiếu hụt két tiền bàn giao</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400">-{formatVND(payslip.cashShortagePenalty)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timesheet List for Period */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Nhật Ký Chấm Công Kỳ Này ({logs.length})</span>
            </h3>

            {logs.length === 0 ? (
              <div className="text-xs text-zinc-400 py-4 text-center">Chưa có bản ghi chấm công nào.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.map((l) => (
                  <div key={l._id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-zinc-200">
                      <span>{formatDateVN(l.date)}</span>
                      <span className="font-mono text-emerald-400 font-bold">{l.totalHours}h</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
                      <span>Thường: {l.standardHours}h | Đêm: {l.nightHours}h</span>
                      {l.lateMinutes > 0 && <span className="text-rose-400 font-bold">Trễ {l.lateMinutes}p</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 text-xs">
          {loading ? 'Đang tính toán dữ liệu lương...' : 'Chưa có dữ liệu tính lương trong khoảng thời gian đã chọn.'}
        </div>
      )}
    </div>
  );
}
