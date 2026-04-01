import { fetchGroups, fetchMembers, fetchCycles, fetchPayments } from '@/lib/data';
import { deriveCycleSummary, getMemberPaymentStatuses } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/header';
import { KpiStats } from '@/components/dashboard/kpi-stats';
import { ActiveCycleCard } from '@/components/dashboard/active-cycle-card';
import { PaymentStatusGrid } from '@/components/dashboard/payment-status-grid';
import { OutstandingAlert } from '@/components/dashboard/outstanding-alert';
import {
  ServerErrorState,
  NoDataState,
  WaitingPaymentState,
} from '@/components/dashboard/empty-states';

interface PageProps {
  searchParams: Promise<{ group?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const groupsResult = await fetchGroups();
  const groups = groupsResult.data;

  // Use the ?group= param only if it matches a known group; otherwise fall back to the first active group
  const fallbackGroupId =
    groups.find(g => g.status === 'active')?.id ?? groups[0]?.id ?? '';
  const selectedGroupId =
    params.group && groups.some(g => g.id === params.group)
      ? params.group
      : fallbackGroupId;

  const [membersResult, cyclesResult, paymentsResult] = await Promise.all([
    fetchMembers(selectedGroupId || undefined),
    fetchCycles(selectedGroupId || undefined),
    fetchPayments(selectedGroupId || undefined),
  ]);

  const serverError =
    !membersResult.ok || !cyclesResult.ok || !paymentsResult.ok;
  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const payments = paymentsResult.data;

  const activeCycle = cycles.find(c => c.status === 'active') ?? null;
  const activeCycleSummary = activeCycle
    ? deriveCycleSummary(activeCycle, members, payments)
    : null;
  const paymentStatuses = activeCycle
    ? getMemberPaymentStatuses(
        members,
        payments,
        activeCycle.id,
        activeCycle.recipientMemberId,
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Circle savings group dashboard"
      >
        <DashboardHeader
          activeCycle={activeCycleSummary}
          groups={groups}
          selectedGroupId={selectedGroupId}
        />

        <div className="mt-8 space-y-6">
          {serverError ? (
            <ServerErrorState />
          ) : cycles.length === 0 ? (
            <NoDataState />
          ) : (
            <>
              {activeCycleSummary && (
                <KpiStats
                  totalKobo={
                    activeCycleSummary.totalMembers *
                    activeCycleSummary.cycle.contributionPerMember
                  }
                  collectedKobo={activeCycleSummary.collectedKobo}
                  paidCount={activeCycleSummary.paidCount}
                  totalMembers={activeCycleSummary.totalMembers}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeCycleSummary && (
                  <ActiveCycleCard summary={activeCycleSummary} />
                )}
                {activeCycle && (
                  <OutstandingAlert
                    statuses={paymentStatuses}
                    contributionPerMemberKobo={activeCycle.contributionPerMember}
                  />
                )}
              </div>

              {activeCycle && paymentStatuses.length === 0 ? (
                <WaitingPaymentState />
              ) : (
                paymentStatuses.length > 0 &&
                activeCycle && (
                  <PaymentStatusGrid
                    statuses={paymentStatuses}
                    cycleId={activeCycle.id}
                    cycleNumber={activeCycle.cycleNumber}
                    contributionKobo={activeCycle.contributionPerMember}
                    cycles={cycles}
                    payments={payments}
                  />
                )
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
