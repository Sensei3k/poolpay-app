import { notFound } from 'next/navigation';
import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchPayments,
} from '@/lib/data';
import { toPoolDetail } from '@/lib/view-models/member';
import { PayView } from '@/components/member/pay-view';

interface PayPageProps {
  params: Promise<{ poolId: string }>;
}

/**
 * Pay flow, the page is centered with max-width 560px on desktop and
 * full-bleed on mobile. The bottom tab bar is hidden on mobile via the
 * route map's `hideMobileTabBar`.
 *
 * The flow is purely instructional today (matching the design's three-
 * step card): the user sends money via their bank app, shares the
 * receipt in the pool's WhatsApp group, then waits for an admin to
 * confirm. Slice 2 ships no "I sent it" Server Action, the design's
 * three-step card is read-only.
 */
export default async function PayPage({ params }: PayPageProps) {
  const { poolId } = await params;

  const [groupsResult, membersResult, cyclesResult, paymentsResult] = await Promise.all([
    fetchGroups(),
    fetchMembers(poolId),
    fetchCycles(poolId),
    fetchPayments(poolId),
  ]);

  const group = groupsResult.data.find((g) => g.id === poolId);
  if (!group) notFound();

  const activeCycle = cyclesResult.data.find((c) => c.status === 'active');
  if (!activeCycle) notFound();

  const detail = toPoolDetail({
    group,
    members: membersResult.data,
    cycles: cyclesResult.data,
    payments: paymentsResult.data,
  });

  return <PayView detail={detail} />;
}
