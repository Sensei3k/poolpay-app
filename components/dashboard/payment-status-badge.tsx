import { CheckCircle2 } from 'lucide-react';

interface PaymentStatusBadgeProps {
  hasPaid: boolean;
  /**
   * - 'row': compact inline badge used inside table card rows (with paid icon).
   * - 'tile': full-height badge used inside the detail overlay status tile.
   */
  variant?: 'row' | 'tile';
}

export function PaymentStatusBadge({ hasPaid, variant = 'row' }: PaymentStatusBadgeProps) {
  if (variant === 'tile') {
    return hasPaid ? (
      <div className="flex-1 flex items-center justify-center rounded-md bg-status-paid/15 border border-status-paid/30 px-2 py-1">
        <span className="text-xs font-semibold text-status-paid">Paid</span>
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center rounded-md bg-status-pending/15 border border-status-pending/30 px-2 py-1">
        <span className="text-xs font-semibold text-status-pending">Outstanding</span>
      </div>
    );
  }

  return hasPaid ? (
    <div className="px-3 py-1.5 rounded-lg bg-status-paid/10 border border-status-paid/30 flex items-center gap-1.5">
      <span className="text-status-paid text-sm font-medium">Paid</span>
      <CheckCircle2 className="h-3.5 w-3.5 text-status-paid" aria-hidden="true" />
    </div>
  ) : (
    <div className="px-3 py-1.5 rounded-lg bg-status-pending/10 border border-status-pending/30">
      <span className="text-status-pending text-sm font-medium">Outstanding</span>
    </div>
  );
}
