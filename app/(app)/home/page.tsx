import { auth } from '@/auth';
import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchPayments,
  fetchReceipts,
} from '@/lib/data';
import { formatNgn } from '@/lib/utils';
import {
  toHomeAggregates,
  toPoolSummary,
  type PoolSummary,
} from '@/lib/view-models/member';
import { AdminEmptyPill } from '@/components/admin/admin-empty-pill';
import { HomeView } from '@/components/member/home-view';

export const metadata = {
  title: 'Home · PoolPay',
  description: 'Your savings groups at a glance.',
};

export default async function HomePage() {
  const session = await auth();
  const role = session?.user?.role ?? 'member';
  const isAdminRole = role === 'admin' || role === 'super_admin';

  const [
    groupsResult,
    membersResult,
    cyclesResult,
    paymentsResult,
    receiptsResult,
  ] = await Promise.all([
    fetchGroups(),
    fetchMembers(),
    fetchCycles(),
    fetchPayments(),
    // Admins seeing /home is the empty-queue path — fetch upfront so we
    // can decide whether to surface the empty pill above the member content.
    isAdminRole ? fetchReceipts() : Promise.resolve({ ok: true as const, data: [] }),
  ]);

  const groups = groupsResult.data;
  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const payments = paymentsResult.data;
  const pendingReceipts = receiptsResult.data.filter(
    (r) => r.status === 'matched' || r.status === 'unmatched',
  );
  const showAdminEmptyPill = isAdminRole && pendingReceipts.length === 0;

  const poolBundles = groups.map((group) => ({
    group,
    members: members.filter((m) => m.groupId === group.id),
    cycles: cycles.filter((c) => c.groupId === group.id),
    payments: payments.filter((p) =>
      cycles.some((c) => c.id === p.cycleId && c.groupId === group.id),
    ),
  }));

  const aggregates = toHomeAggregates({
    pools: poolBundles.map(({ members: m, cycles: c, payments: p }) => ({
      members: m,
      cycles: c,
      payments: p,
    })),
  });

  const poolSummaries: PoolSummary[] = poolBundles.map((b) =>
    toPoolSummary({
      group: b.group,
      members: b.members,
      cycles: b.cycles,
      payments: b.payments,
    }),
  );

  // Heuristic for slice 2 mock data — smallest active-cycle payout pot
  // is treated as the "next" payout. Real next-due-cycle arrives with the
  // API.
  const nextPayoutKobo = (() => {
    let best = 0;
    for (const { cycles: c, members: m } of poolBundles) {
      const active = c.find((cc) => cc.status === 'active');
      if (!active) continue;
      const total = active.contributionPerMember * Math.max(0, m.length);
      if (best === 0 || total < best) best = total;
    }
    return best;
  })();

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {showAdminEmptyPill && <AdminEmptyPill groupCount={groups.length} />}
      <HomeView
        aggregates={aggregates}
        pools={poolSummaries}
        nextPayoutLabel={formatNgn(nextPayoutKobo)}
        todayLabel={todayLabel}
      />
    </>
  );
}
