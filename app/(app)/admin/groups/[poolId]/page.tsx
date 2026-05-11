import { notFound } from 'next/navigation';
import { GroupView, type GroupViewData } from '@/components/admin/group-view';
import type { GroupSettingsRow } from '@/components/admin/group-settings-view';
import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchPayments,
  fetchReceipts,
} from '@/lib/data';
import { formatNgn } from '@/lib/utils';
import {
  isAdminGroupTabId,
  toAdminCycleRow,
  toAdminGroupHeader,
  toAdminGroupOverview,
  toAdminMemberRow,
  toAdminPaymentRow,
  toReceiptQueueRow,
  type AdminGroupActivityRow,
  type AdminGroupTabId,
  type ReceiptQueueRow,
} from '@/lib/view-models/admin';

export const metadata = {
  title: 'Group · PoolPay',
};

interface AdminGroupPageProps {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const DEFAULT_TAB: AdminGroupTabId = 'overview';

/**
 * `?tab=overview|members|cycles|payments|receipts|settings`. Falls back
 * to `overview` when missing or invalid so the route is always renderable.
 */
function pickTab(raw: string | undefined): AdminGroupTabId {
  if (!raw) return DEFAULT_TAB;
  return isAdminGroupTabId(raw) ? raw : DEFAULT_TAB;
}

/**
 * The activity log is server-derived in slice 5 (real audit-trail entries).
 * For slice 3 we leave it empty, the overview card collapses gracefully
 * because the activity list itself just renders zero rows. Hard-coding
 * fake "you confirmed X" lines into a production page would lie to the
 * admin, so we surface nothing instead.
 */
const EMPTY_ACTIVITY: ReadonlyArray<AdminGroupActivityRow> = [];

export default async function AdminGroupPage({
  params,
  searchParams,
}: AdminGroupPageProps) {
  const { poolId } = await params;
  const { tab } = await searchParams;
  const activeTab = pickTab(tab);

  // Receipts data is only consumed by `overview` (for the recent-activity
  // strip) and the `receipts` tab. Every other tab can skip the joins
  // entirely. The check is cheap today against the mock `fetchReceipts`
  // shim (which returns []), but once slice 5 lands the real query this
  // avoids two cross-group fan-outs on tabs that never read them.
  const wantsReceipts = activeTab === 'overview' || activeTab === 'receipts';

  const emptyReceipts = Promise.resolve({ ok: true as const, data: [] });

  const [
    groupsResult,
    membersResult,
    cyclesResult,
    paymentsResult,
    groupReceiptsResult,
    allReceiptsResult,
  ] = await Promise.all([
    fetchGroups(),
    fetchMembers(poolId),
    fetchCycles(poolId),
    fetchPayments(poolId),
    wantsReceipts ? fetchReceipts(poolId) : emptyReceipts,
    wantsReceipts ? fetchReceipts() : emptyReceipts,
  ]);

  const group = groupsResult.data.find((g) => g.id === poolId);
  if (!group) {
    notFound();
  }

  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const payments = paymentsResult.data;
  const groupReceipts = groupReceiptsResult.data;
  const allReceipts = allReceiptsResult.data;
  const now = new Date();

  const header = toAdminGroupHeader(group, members);

  const overview = toAdminGroupOverview({
    group,
    members,
    cycles,
    payments,
    activity: EMPTY_ACTIVITY,
  });

  const memberRows = members.map((member) =>
    toAdminMemberRow({ member, cycles, payments }),
  );

  const cycleRows = cycles.map((cycle) =>
    toAdminCycleRow({ cycle, members, payments }),
  );

  const paymentRows = payments.map((payment) =>
    toAdminPaymentRow({
      payment,
      member: members.find((m) => m.id === payment.memberId),
      cycle: cycles.find((c) => c.id === payment.cycleId),
      now,
    }),
  );

  const receiptRows: ReadonlyArray<ReceiptQueueRow> = groupReceipts.flatMap(
    (receipt) => {
      const cycle = cycles.find((c) => c.id === receipt.cycleId);
      const member =
        receipt.matchedMemberId === null
          ? null
          : members.find((m) => m.id === receipt.matchedMemberId) ?? null;
      return [
        toReceiptQueueRow({ receipt, group, cycle, member, now }),
      ];
    },
  );

  const settingsRows: ReadonlyArray<GroupSettingsRow> = [
    { kicker: 'Name', value: group.name },
    { kicker: 'Cadence', value: 'Weekly · NGN' },
    {
      kicker: 'Contribution',
      value: cycles[0]
        ? formatNgn(cycles[0].contributionPerMember)
        : '-',
    },
    { kicker: 'Members', value: String(members.length) },
    {
      kicker: 'Active cycle',
      value: (() => {
        const active = cycles.find((c) => c.status === 'active');
        return active
          ? `cycle ${active.cycleNumber} of ${cycles.length}`
          : `${cycles.length} cycles`;
      })(),
    },
  ];

  const data: GroupViewData = {
    header,
    overview,
    members: memberRows,
    cycles: cycleRows,
    payments: paymentRows,
    receipts: receiptRows,
    settings: {
      poolRows: settingsRows,
      whatsappGroupId: '-',
      whatsappGroupLabel: 'Not linked',
      whatsappActive: false,
      toggles: { autoNudge: false, allowUnlinkedReceipts: false },
    },
  };

  const crossGroupReceiptCount = allReceipts.filter(
    (r) => r.status === 'matched' || r.status === 'unmatched',
  ).length;

  return (
    <GroupView
      poolId={poolId}
      activeTab={activeTab}
      crossGroupReceiptCount={crossGroupReceiptCount}
      data={data}
    />
  );
}
