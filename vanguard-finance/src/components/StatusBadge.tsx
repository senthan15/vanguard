import React from 'react';
import { InvoiceStatus } from '@/types/vanguard';
import { Clock, CheckCircle, Coins, DollarSign, BadgeCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: InvoiceStatus | string; // Allow any string from backend
  size?: 'sm' | 'md';
}

// Map backend status values to display configuration
const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  // Backend values (capitalized)
  'Anchored': {
    label: 'Anchored',
    className: 'status-pending',
    icon: Clock,
  },
  'Verified': {
    label: 'Verified',
    className: 'status-signed',
    icon: CheckCircle,
  },
  'Funded': {
    label: 'Funded',
    className: 'status-funded',
    icon: DollarSign,
  },
  'Repaid': {
    label: 'Repaid',
    className: 'status-minted',
    icon: Coins,
  },
  'Settled': {
    label: 'Settled',
    className: 'status-settled',
    icon: BadgeCheck,
  },
  // Legacy lowercase values (for backward compatibility)
  'pending': {
    label: 'Pending',
    className: 'status-pending',
    icon: Clock,
  },
  'signed': {
    label: 'Signed',
    className: 'status-signed',
    icon: CheckCircle,
  },
  'minted': {
    label: 'Minted',
    className: 'status-minted',
    icon: Coins,
  },
  'funded': {
    label: 'Funded',
    className: 'status-funded',
    icon: DollarSign,
  },
  'settled': {
    label: 'Settled',
    className: 'status-settled',
    icon: BadgeCheck,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  // Fallback for undefined or unknown statuses
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    className: 'status-pending',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};
