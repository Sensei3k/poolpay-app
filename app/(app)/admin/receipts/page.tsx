import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchReceipts,
} from '@/lib/data';
import { ReceiptsView } from '@/components/admin/receipts-view';
import {
  toQueueAggregates,
  toReceiptQueueRow,
  type ReceiptQueueRow,
} from '@/lib/view-models/admin';

export const metadata = {
  title: 'Receipts queue · PoolPay',
  description: 'Pending payment receipts awaiting admin review.',
};

/**
 * Cross-group receipts queue. Server-rendered: each request joins the
 * receipts list against groups / cycles / members so the queue rows are
 * fully resolved when they reach the client component tree.
 *
 * `fetchReceipts` returns an empty list today (no WhatsApp ingestion yet
 * in slice 3 — that lands in slice 5). The route still wires the
 * full data graph so the day slice 5 lights up the backend, the page
 * is one one-line fetcher swap away from live.
 */
export default async function AdminReceiptsPage() {
  const [receiptsResult, groupsResult, membersResult, cyclesResult] =
    await Promise.all([
      fetchReceipts(),
      fetchGroups(),
      fetchMembers(),
      fetchCycles(),
    ]);

  const receipts = receiptsResult.data;
  const groups = groupsResult.data;
  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const now = new Date();

  const rows: ReadonlyArray<ReceiptQueueRow> = receipts.flatMap((receipt) => {
    const group = groups.find((g) => g.id === receipt.groupId);
    if (!group) return [];
    const cycle = cycles.find((c) => c.id === receipt.cycleId);
    const member =
      receipt.matchedMemberId === null
        ? null
        : members.find((m) => m.id === receipt.matchedMemberId) ?? null;
    return [
      toReceiptQueueRow({
        receipt,
        group,
        cycle,
        member,
        now,
      }),
    ];
  });

  const aggregates = toQueueAggregates({ receipts, now });

  return (
    <ReceiptsView
      rows={rows}
      aggregates={aggregates}
      groupCount={groups.length}
    />
  );
}
