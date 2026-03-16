import { AlertTriangle } from 'lucide-react';
import type { MemberPaymentStatus } from '@/lib/types';
import { formatNgn } from '@/lib/utils';

interface OutstandingAlertProps {
  statuses: MemberPaymentStatus[];
  contributionPerMemberKobo: number;
}

export function OutstandingAlert({
  statuses,
  contributionPerMemberKobo,
}: OutstandingAlertProps) {
  const outstanding = statuses.filter(s => !s.hasPaid);

  if (outstanding.length === 0) return null;

  return (
    <div
      role="alert"
      aria-label={`${outstanding.length} member${outstanding.length > 1 ? 's' : ''} with outstanding payments`}
      className="rounded-xl border border-ajo-outstanding/20 bg-ajo-outstanding-subtle px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-ajo-outstanding"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ajo-outstanding">
            {outstanding.length} outstanding payment{outstanding.length > 1 ? 's' : ''}
          </p>

          <ul className="mt-2 space-y-1.5" aria-label="Members who have not yet paid">
            {outstanding.map(({ member }) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-foreground">{member.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatNgn(contributionPerMemberKobo)} owed
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
