'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  LogOut,
  UserCheck,
  ShieldAlert,
  Clock,
  LayoutDashboard,
  Calendar,
  DollarSign,
  ArrowLeftRight,
} from 'lucide-react';
import RoleBadge from './RoleBadge';

interface UserData {
  id: string;
  code: string;
  name: string;
  role: string;
}

export default function Navbar({ user }: { user?: UserData | null }) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                CYBERSPACE NETCAFE
              </span>
              <span className="block text-[10px] tracking-wider text-zinc-400 font-semibold uppercase">
                Shift & Payroll Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Live Clock & Navigation */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-sm shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-medium text-zinc-200">{user.name}</span>
                  <span className="text-xs text-zinc-400 font-mono">({user.code})</span>
                </div>
                <RoleBadge role={user.role} />
              </div>

              {user.role === 'ADMIN' ? (
                <Link
                  href="/admin"
                  className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors text-xs font-semibold flex items-center space-x-1"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Quản Trị</span>
                </Link>
              ) : (
                <Link
                  href="/staff-portal"
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-xs font-semibold flex items-center space-x-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Portal Nhân Viên</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 border border-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
              >
                Đăng Nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
