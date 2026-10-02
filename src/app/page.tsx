import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import {
  Gamepad2,
  Users,
  Calendar,
  Clock3,
  Receipt,
  Calculator,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();

  const serializedUser = user
    ? {
        id: user._id.toString(),
        code: user.code,
        name: user.name,
        role: user.role,
      }
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      <Navbar user={serializedUser} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyên sâu cho Quản lý & Vận hành Phòng Net Gaming 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Hệ Thống Phân Ca, Giao Ca, Chấm Giờ &{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Tính Lương Tự Động
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Giải pháp toàn diện tối ưu cho tiệm Net: Quản lý lưới 24h, điểm danh đầu/cuối ca qua PIN & Wi-Fi,
              bàn giao két tiền – kiểm kê F&B chống hao hụt và tự động chốt bảng lương bóc tách giờ đêm (22h–6h).
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/admin"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center space-x-2 hover:scale-102"
              >
                <span>Mở Bảng Quản Trị (Admin)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/staff-portal"
                className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-sm transition-all flex items-center space-x-2 hover:scale-102"
              >
                <span>Portal Điểm Danh Nhân Viên</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5 Deep Modules Grid */}
        <section className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              5 Trụ Cột Nghiệp Vụ Chuyên Sâu
            </h2>
            <p className="text-xs text-zinc-400">Được tối ưu theo thực tế vận hành chuỗi phòng net Cyber Gaming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">1. Hồ Sơ & Định Mức Lương</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Quản lý hồ sơ Thu ngân, Phục vụ, Kỹ thuật, Lao công. Thiết lập đơn giá VND/giờ linh hoạt,
                phụ cấp ca đêm (22h–6h sáng), lương cứng, thưởng chuyên cần và phạt thiếu hụt két.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">2. Lưới Phân Ca 24h & Đổi Ca</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tái hiện trực quan Timeline 24 cột giờ/ngày theo vị trí. Gom ca 1 (06h–14h), Ca 2 (14h–22h), Ca 3 (22h–06h).
                Xử lý luồng xin đổi ca trực hoặc xin nghỉ với cơ chế Quản lý duyệt.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Clock3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">3. Chấm Giờ & Điểm Danh Wi-Fi/PIN</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Check-in/Check-out nhanh với mã PIN 4 số. Tự động phát hiện đi muộn, về sớm và tổng hợp Timesheet
                bóc tách giờ tiêu chuẩn, giờ làm đêm và giờ tăng ca (OT).
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">4. Giao Ca & Bàn Giao Két Tiền</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Biên bản bàn giao ca bắt buộc 2 bên xác nhận. Đối soát tiền nạp máy, F&B, chi tạm ứng, đếm tiền thực tế tính
                thừa/thiếu. Kiểm kê hao hụt Sting, Mì gói và ghi nhật ký máy lỗi.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">5. Tính Lương Tự Động & Xuất Phiếu</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Công thức tự động cộng giờ thường, nhân hệ số ca đêm, cộng phụ cấp và trừ phạt trễ / hụt két.
                Khóa sổ kỳ lương, xuất file Excel và in phiếu lương chi tiết cho nhân viên.
              </p>
            </div>

            {/* Live Operations Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trực Quan Hóa 24/7</span>
                </div>
                <h3 className="text-lg font-black text-zinc-100">Bắt đầu trải nghiệm ngay</h3>
                <p className="text-xs text-zinc-300">
                  Hệ thống đã sẵn sàng với bộ dữ liệu mẫu đầy đủ các ca trực và nhân sự.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  <span>Truy Cập Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-400">
        <p>CYBERSPACE PRO NETCAFE SHIFT & PAYROLL MANAGEMENT SYSTEM &copy; 2026</p>
      </footer>
    </div>
  );
}
