import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchPayments,
} from '@/lib/data';
import { toPoolDetail } from '@/lib/view-models/member';
import { PoolDetailView } from '@/components/member/pool-detail-view';

interface PoolDetailPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { poolId } = await params;

  const [groupsResult, membersResult, cyclesResult, paymentsResult] = await Promise.all([
    fetchGroups(),
    fetchMembers(poolId),
    fetchCycles(poolId),
    fetchPayments(poolId),
  ]);

  const group = groupsResult.data.find((g) => g.id === poolId);
  if (!group) {
    notFound();
  }

  const activeCycle = cyclesResult.data.find((c) => c.status === 'active');
  if (!activeCycle) {
    return (
      <main
        id="main-content"
        className="flex flex-col gap-3"
        aria-labelledby="pool-empty-title"
      >
        <h1
          id="pool-empty-title"
          className="text-[1.5rem] font-semibold tracking-tight text-d2-ink"
        >
          {group.name}
        </h1>
        <p className="text-[13px] text-d2-ink/55">
          This pool has no active cycle. An admin will start the next cycle when
          ready.
        </p>
        <Link
          href="/home"
          className="text-[13px] font-medium text-d2-accent"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const detail = toPoolDetail({
    group,
    members: membersResult.data,
    cycles: cyclesResult.data,
    payments: paymentsResult.data,
  });

  return <PoolDetailView detail={detail} />;
}
