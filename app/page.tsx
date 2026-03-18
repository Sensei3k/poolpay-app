import { fetchMembers, fetchCycles, fetchPayments } from '@/lib/data';
import { deriveCycleSummary, getMemberPaymentStatuses } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/header';
import { KpiStats } from '@/components/dashboard/kpi-stats';
import { ActiveCycleCard } from '@/components/dashboard/active-cycle-card';
import { PaymentStatusGrid } from '@/components/dashboard/payment-status-grid';
import { OutstandingAlert } from '@/components/dashboard/outstanding-alert';

export default async function DashboardPage() {
  const [members, cycles, payments] = await Promise.all([
    fetchMembers(),
    fetchCycles(),
    fetchPayments(),
  ]);

  const activeCycle = cycles.find(c => c.status === 'active') ?? null;
  const activeCycleSummary = activeCycle
    ? deriveCycleSummary(activeCycle, members, payments)
    : null;
  const paymentStatuses = activeCycle
    ? getMemberPaymentStatuses(members, payments, activeCycle.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <main
        id="main-content"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Circle savings group dashboard"
      >
        <DashboardHeader activeCycle={activeCycleSummary} />

        <div className="mt-8 space-y-6">
          {activeCycleSummary && (
            <KpiStats
              totalKobo={activeCycleSummary.cycle.totalAmount}
              collectedKobo={activeCycleSummary.collectedKobo}
              paidCount={activeCycleSummary.paidCount}
              totalMembers={activeCycleSummary.totalMembers}
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-4">
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

            {paymentStatuses.length > 0 && activeCycle && (
              <PaymentStatusGrid
                statuses={paymentStatuses}
                cycleId={activeCycle.id}
                cycleNumber={activeCycle.cycleNumber}
                contributionKobo={activeCycle.contributionPerMember}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
