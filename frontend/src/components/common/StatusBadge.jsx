import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || '').toUpperCase();

  let config = {
    bg: 'bg-secondary',
    text: 'text-foreground',
    border: 'border-border',
    icon: Clock,
    label: status || 'UNKNOWN'
  };

  switch (normalized) {
    case 'PAID':
    case 'SETTLED':
    case 'SUCCESS':
    case 'ACTIVE':
    case 'TRUSTED':
    case 'VERIFIED':
    case 'INTEGRITY_VERIFIED':
    case 'ALLOW':
    case 'APPROVED':
      config = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        label: status
      };
      break;

    case 'BLOCKED':
    case 'FAILED':
    case 'RESTRICTED':
    case 'UNTRUSTED':
    case 'INTEGRITY_FAILED':
    case 'BLOCK':
    case 'REJECTED':
      config = {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: XCircle,
        label: status
      };
      break;

    case 'WARNING':
    case 'ATTACK_DETECTED':
    case 'OVERRIDDEN':
    case 'VIOLATION':
    case 'CRITICAL':
    case 'HIGH':
      config = {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
        icon: ShieldAlert,
        label: status
      };
      break;

    case 'MEDIUM':
    case 'COUNTER':
    case 'COUNTERED':
    case 'NEGOTIATE':
      config = {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        icon: AlertTriangle,
        label: status
      };
      break;

    case 'PENDING':
    case 'AUTHORIZED':
    case 'LOW':
    case 'DISABLED':
      config = {
        bg: 'bg-secondary',
        text: 'text-muted-foreground',
        border: 'border-border',
        icon: Clock,
        label: status
      };
      break;

    default:
      config = {
        bg: 'bg-secondary',
        text: 'text-foreground',
        border: 'border-border',
        icon: CheckCircle2,
        label: status
      };
  }

  const Icon = config.icon;
  const isXs = size === 'xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${
      isXs ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
    }`}>
      <Icon className={isXs ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
