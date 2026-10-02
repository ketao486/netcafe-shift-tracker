'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Lock, User, KeyRound, ShieldAlert, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'PASSWORD' | 'PIN'>('PASSWORD');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = tab === 'PIN' ? { pin, mode: 'PIN' } : { username, password, mode: 'PASSWORD' };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/staff-portal');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: string) => {
    setLoading(true);
    setError('');

    let payload: any = {};
    if (userType === 'ADMIN') payload = { username: 'admin', password: 'admin123' };
    if (userType === 'CASHIER1') payload = { username: 'bao.tran', password: '123456' };
    if (userType === 'CASHIER2') payload = { username: 'hoa.le', password: '123456' };
    if (userType === 'TECH') payload = { username: 'hung.nguyen', password: '123456' };
    if (userType === 'SERVICE') payload = { username: 'tuan.pham', password: '123456' };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập nhanh thất bại');
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/staff-portal');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-zinc-950 font-black shadow-xl shadow-emerald-500/20 mb-2">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            CYBERSPACE NETCAFE
          </h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
            Hệ Thống Phân Ca – Giao Ca – Chấm Giờ – Tính Lương
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => setTab('PASSWORD')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'PASSWORD'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tài Khoản / Mật Khẩu</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('PIN')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'PIN'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Điểm Danh Mã PIN</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {tab === 'PASSWORD' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Tên đăng nhập hoặc Mã NV</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="admin hoặc NV001..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center">
                <label className="text-xs font-semibold text-zinc-300 block">Nhập mã PIN 4 số của nhân viên</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-44 mx-auto text-center tracking-[0.5em] text-2xl font-mono font-bold bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 text-emerald-400 placeholder-zinc-400 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition"
                />
                <p className="text-[11px] text-zinc-400">
                  Dành cho nhân viên chấm công nhanh tại quầy hoặc máy trạm kiosk.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Đăng nhập nhanh (Tài khoản mẫu):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition text-xs space-y-0.5"
              >
                <div className="font-bold text-purple-300 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Quản Lý (Admin)</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CASHIER1')}
                className="p-2 text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition text-xs space-y-0.5"
              >
                <div className="font-bold text-emerald-300">Thu Ngân (Ca 1)</div>
                <div className="text-[10px] text-zinc-400 font-mono">bao.tran / PIN 1111</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CASHIER2')}
                className="p-2 text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition text-xs space-y-0.5"
              >
                <div className="font-bold text-emerald-300">Thu Ngân (Ca 2)</div>
                <div className="text-[10px] text-zinc-400 font-mono">hoa.le / PIN 2222</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('TECH')}
                className="p-2 text-left bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition text-xs space-y-0.5"
              >
                <div className="font-bold text-amber-300">Kỹ Thuật (Ca 3)</div>
                <div className="text-[10px] text-zinc-400 font-mono">hung.nguyen / PIN 3333</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
