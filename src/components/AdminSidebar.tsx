'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock3,
  Receipt,
  Calculator,
  ArrowLeftRight,
  Settings,
  ChevronRight,
} from 'lucide-react';

const MENU_ITEMS = [
  { href: '/admin', label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard },
  { href: '/admin/staff', label: 'Hồ Sơ & Đơn Giá Lương', icon: Users },
  { href: '/admin/schedule', label: 'Lưới Phân Ca 24h', icon: CalendarDays },
  { href: '/admin/attendance', label: 'Chấm Giờ & Timesheet', icon: Clock3 },
  { href: '/admin/handover', label: 'Giao Ca & Két Tiền', icon: Receipt },
  { href: '/admin/payroll', label: 'Tính Lương & Xuất Phiếu', icon: Calculator },
  { href: '/admin/swap-requests', label: 'Duyệt Đổi Ca / Nghỉ', icon: ArrowLeftRight },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950/60 border-r border-zinc-800/80 p-4 shrink-0 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Phân Hệ Quản Trị
        </div>

        <nav className="space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-800/60 px-2">
        <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
          <div className="font-semibold text-zinc-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CYBER CAFE ENGINE v2.0</span>
          </div>
          <p className="text-[11px] text-zinc-400">Đang hoạt động: 24/7 Full Multi-Shift</p>
        </div>
      </div>
    </aside>
  );
}
