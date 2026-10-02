'use client';

import React, { useState, useEffect } from 'react';
import { formatDateVN, formatDateTimeVN, formatVND } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';
import {
  Receipt,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Wrench,
  HelpCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminHandoverPage() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHandover, setSelectedHandover] = useState<any | null>(null);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/handovers');
      const data = await res.json();
      if (data.success) {
        setHandovers(data.handovers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  const totalCashShortages = handovers.reduce((sum, h) => {
    if (h.cashAudit?.difference < 0) {
      return sum + Math.abs(h.cashAudit.difference);
    }
    return sum;
  }, 0);

  const disputedCount = handovers.filter((h) => h.status === 'DISPUTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Đối Soát Giao Ca & Két Tiền (Handover Audit)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kiểm tra đối soát két tiền, doanh thu F&B/nạp giờ net, kiểm kê tồn kho nhanh và nhật ký sự cố bàn giao
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tổng Biên Bản Bàn Giao</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-zinc-100">{handovers.length}</div>
          <p className="text-[11px] text-zinc-400">Lưu trữ toàn bộ lịch sử các ca</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Tổng Tiền Thiếu Hụt Két</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{formatVND(totalCashShortages)}</div>
          <p className="text-[11px] text-zinc-400">Tự động trừ vào bảng lương nhân sự liên quan</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ca Khiếu Nại / Bất Đồng</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{disputedCount} ca</div>
          <p className="text-[11px] text-zinc-400">Cần Quản lý can thiệp phân xử</p>
        </div>
      </div>

      {/* Handover List Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Ngày & Ca Làm</th>
                <th className="py-3.5 px-4">Người Giao</th>
                <th className="py-3.5 px-4">Người Nhận</th>
                <th className="py-3.5 px-4">Doanh Thu Trong Ca</th>
                <th className="py-3.5 px-4">Tiền Chi Tạm Ứng</th>
                <th className="py-3.5 px-4">Tiền Mặt Đếm Thực Tế</th>
                <th className="py-3.5 px-4">Chênh Lệch</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-zinc-400">
                    Đang tải danh sách biên bản giao ca...
                  </td>
                </tr>
              ) : handovers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-zinc-400">
                    Chưa có biên bản giao ca nào được tạo.
                  </td>
                </tr>
              ) : (
                handovers.map((h) => {
                  const rev = (h.cashAudit?.netBillingRevenue || 0) + (h.cashAudit?.fnbRevenue || 0);
                  const diff = h.cashAudit?.difference || 0;

                  return (
                    <tr key={h._id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-100">{formatDateVN(h.date)}</div>
                        <div className="text-[11px] text-zinc-400">{h.shiftName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-200">{h.fromUserId?.name || 'N/A'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">[{h.fromUserId?.code}]</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {h.toUserId ? (
                          <>
                            <div className="font-bold text-zinc-200">{h.toUserId?.name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">[{h.toUserId?.code}]</div>
                          </>
                        ) : (
                          <span className="text-amber-400 italic">Chưa nhận ca</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatVND(rev)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-400">
                        {formatVND(h.cashAudit?.totalExpenses || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-100">
                        {formatVND(h.cashAudit?.actualCash || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {diff === 0 ? (
                          <span className="text-emerald-400">Khớp 0 đ</span>
                        ) : diff < 0 ? (
                          <span className="text-rose-400">Thiếu {formatVND(Math.abs(diff))}</span>
                        ) : (
                          <span className="text-cyan-400">Thừa {formatVND(diff)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            h.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : h.status === 'DISPUTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {h.status === 'CONFIRMED'
                            ? 'Đã Khớp & Xác Nhận'
                            : h.status === 'DISPUTED'
                            ? 'Khiếu Nại'
                            : 'Chờ Ca Sau Ký'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedHandover(h)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 border border-zinc-700 transition flex items-center space-x-1 ml-auto text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Detail Modal */}
      {selectedHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span>Biên Bản Bàn Giao Ca #{selectedHandover._id.slice(-6).toUpperCase()}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ngày {formatDateVN(selectedHandover.date)} — {selectedHandover.shiftName}
                </p>
              </div>

              <button
                onClick={() => setSelectedHandover(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Handover Signers info */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-[11px] text-zinc-400 block font-semibold uppercase">Người giao ca (Hết ca)</span>
                <span className="font-bold text-sm text-emerald-400">{selectedHandover.fromUserId?.name}</span>
                <span className="text-xs text-zinc-400 block">Mã NV: {selectedHandover.fromUserId?.code}</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block font-semibold uppercase">Người nhận ca (Vào ca)</span>
                <span className="font-bold text-sm text-cyan-400">{selectedHandover.toUserId?.name || 'Chưa nhận'}</span>
                <span className="text-xs text-zinc-400 block">
                  {selectedHandover.confirmedAt
                    ? `Ký nhận lúc: ${formatDateTimeVN(selectedHandover.confirmedAt)}`
                    : 'Đang chờ ký nhận'}
                </span>
              </div>
            </div>

            {/* Cash register breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4" />
                <span>1. Đối Soát Két Tiền & Dòng Tiền Ca Trực</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Tiền Đầu Ca</span>
                  <span className="font-mono font-bold text-sm text-zinc-200">
                    {formatVND(selectedHandover.cashAudit?.openingCash || 0)}
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Doanh Thu Nạp Net</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    +{formatVND(selectedHandover.cashAudit?.netBillingRevenue || 0)}
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Doanh Thu F&B/Thẻ</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    +{formatVND(selectedHandover.cashAudit?.fnbRevenue || 0)}
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Chi Tạm Ứng / Chi Vặt</span>
                  <span className="font-mono font-bold text-sm text-rose-400">
                    -{formatVND(selectedHandover.cashAudit?.totalExpenses || 0)}
                  </span>
                </div>
              </div>

              {/* Total Theoretical vs Actual */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-400">Tiền Két Lý Thuyết: </span>
                  <span className="font-mono font-bold text-zinc-200">
                    {formatVND(selectedHandover.cashAudit?.totalExpectedCash || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400">Tiền Thực Đếm: </span>
                  <span className="font-mono font-bold text-base text-zinc-100">
                    {formatVND(selectedHandover.cashAudit?.actualCash || 0)}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700">
                  <span className="text-xs font-semibold">Chênh lệch: </span>
                  <span
                    className={`font-mono font-bold ${
                      selectedHandover.cashAudit?.difference === 0
                        ? 'text-emerald-400'
                        : selectedHandover.cashAudit?.difference < 0
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {formatVND(selectedHandover.cashAudit?.difference || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* F&B Stock quick audit */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Package className="w-4 h-4" />
                <span>2. Bảng Kiểm Kê Hàng Hóa / Nước Uống Ca Trực</span>
              </h3>

              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Mặt Hàng</th>
                      <th className="py-2.5 px-3">Đầu Ca</th>
                      <th className="py-2.5 px-3">Nhập Thêm</th>
                      <th className="py-2.5 px-3">Đã Bán</th>
                      <th className="py-2.5 px-3">Tồn Lý Thuyết</th>
                      <th className="py-2.5 px-3">Thực Đếm</th>
                      <th className="py-2.5 px-3">Chênh Lệch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {selectedHandover.stockAudit?.map((st: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-950/40">
                        <td className="py-2.5 px-3 font-sans font-medium text-zinc-200">{st.itemName}</td>
                        <td className="py-2.5 px-3">{st.initialQty}</td>
                        <td className="py-2.5 px-3 text-cyan-400">+{st.importQty}</td>
                        <td className="py-2.5 px-3 text-rose-400">-{st.soldQty}</td>
                        <td className="py-2.5 px-3 font-bold text-zinc-200">{st.expectedQty}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{st.actualQty}</td>
                        <td className="py-2.5 px-3">
                          {st.difference === 0 ? (
                            <span className="text-emerald-400">0</span>
                          ) : (
                            <span className="text-rose-400 font-bold">{st.difference}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incidents & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center space-x-1">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Sự Cố Phần Cứng / Máy Trạm</span>
                </span>
                {selectedHandover.incidentLogs?.length === 0 ? (
                  <p className="text-xs text-zinc-400">Không có sự cố nào ghi nhận.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedHandover.incidentLogs?.map((inc: any, i: number) => (
                      <div key={i} className="text-xs text-zinc-300 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                        <strong className="text-amber-300">[{inc.machineNumber}]</strong> {inc.issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs font-bold text-purple-400 uppercase flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Đồ Khách Bỏ Quên / Ghi Chú</span>
                </span>
                {selectedHandover.customerLostItems?.length > 0 ? (
                  selectedHandover.customerLostItems.map((lost: any, i: number) => (
                    <div key={i} className="text-xs text-zinc-300 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                      <strong>{lost.seatOrArea}:</strong> {lost.itemDescription}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400">Không có đồ thất lạc.</p>
                )}
                <p className="text-xs text-zinc-400 italic pt-1">
                  Ghi chú: {selectedHandover.generalNotes || 'Không có ghi chú thêm.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                onClick={() => setSelectedHandover(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700"
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
