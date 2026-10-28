import React from 'react';
import { Clock, Coffee, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'รอรับออเดอร์',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
  },
  in_progress: {
    label: 'กำลังชงกาแฟ',
    color: 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
    icon: Coffee,
  },
  ready: {
    label: 'พร้อมรับเครื่องดื่ม',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold ring-2 ring-emerald-300 animate-bounce',
    icon: PackageCheck,
  },
  completed: {
    label: 'รับเรียบร้อยแล้ว',
    color: 'bg-stone-100 text-stone-700 border-stone-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'ยกเลิกคำสั่งซื้อ',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-all shadow-sm ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
}
