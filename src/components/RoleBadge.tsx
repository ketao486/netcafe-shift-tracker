import React from 'react';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export const ROLE_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  ADMIN: { label: 'Quản Lý', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  CASHIER: { label: 'Thu Ngân', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  SERVICE: { label: 'Phục Vụ', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  TECH: { label: 'Kỹ Thuật', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  CLEANER: { label: 'Lao Công', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const conf = ROLE_LABELS[role] || {
    label: role,
    bg: 'bg-zinc-800',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${conf.bg} ${conf.text} ${conf.border} ${className}`}
    >
      {conf.label}
    </span>
  );
}
