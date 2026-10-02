'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Calendar, Receipt, FileText } from 'lucide-react';

const STAFF_TABS = [
  { href: '/staff-portal', label: 'Điểm Danh & Bàn Làm Việc', icon: Clock },
  { href: '/staff-portal/schedule', label: 'Lịch Làm & Đổi Ca', icon: Calendar },
  { href: '/staff-portal/handover', label: 'Bàn Giao Ca & Két Tiền', icon: Receipt },
  { href: '/staff-portal/payslip', label: 'Phiếu Lương & Công', icon: FileText },
];

export default function StaffHeader() {
  const pathname = usePathname();

  return (
    <div className="bg-zinc-950/60 border-b border-zinc-800/80 mb-6 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
          {STAFF_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
