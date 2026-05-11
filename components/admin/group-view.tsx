import { MessageSquare } from 'lucide-react';
import {
  isMobileBlockedTab,
  type AdminCycleRow,
  type AdminGroupHeader,
  type AdminGroupOverview,
  type AdminGroupTabId,
  type AdminMemberRow,
  type AdminPaymentRow,
  type ReceiptQueueRow,
} from '@/lib/view-models/admin';
import { GroupCyclesView } from './group-cycles-view';
import { GroupMembersView } from './group-members-view';
import { GroupOverviewView } from './group-overview-view';
import { GroupPaymentsView } from './group-payments-view';
import { GroupReceiptsView } from './group-receipts-view';
import { GroupSettingsView, type GroupSettingsRow } from './group-settings-view';
import { GroupTabsNav } from './group-tabs-nav';
import { MobileReadonlyPrompt } from './mobile-readonly-prompt';
import { PoolGlyph } from './pool-glyph';

export interface GroupViewData {
  header: AdminGroupHeader;
  overview: AdminGroupOverview;
  members: ReadonlyArray<AdminMemberRow>;
  cycles: ReadonlyArray<AdminCycleRow>;
  payments: ReadonlyArray<AdminPaymentRow>;
  receipts: ReadonlyArray<ReceiptQueueRow>;
  settings: {
    poolRows: ReadonlyArray<GroupSettingsRow>;
    whatsappGroupId: string;
    whatsappGroupLabel: string;
    whatsappActive: boolean;
    toggles: { autoNudge: boolean; allowUnlinkedReceipts: boolean };
  };
}

export interface GroupViewProps {
  poolId: string;
  /** Tab currently selected by `?tab=…` (`'overview'` when missing). */
  activeTab: AdminGroupTabId;
  /** Cross-group receipt queue count for the sidebar callout. */
  crossGroupReceiptCount: number;
  data: GroupViewData;
}

const TAB_LABEL: Record<AdminGroupTabId, string> = {
  overview: 'Overview',
  members: 'Members',
  cycles: 'Cycles',
  payments: 'Payments',
  receipts: 'Receipts',
  settings: 'Settings',
};

const MOBILE_BLOCKED_REASON: Record<string, string> = {
  settings:
    'Editing pool meta and WhatsApp wiring is a desktop task. Triage stays available on mobile.',
  members:
    'Inviting members, reordering rotation, and removing people need more room than mobile offers.',
  cycles:
    'Editing the rotation table is a 5-column affordance — open this group on desktop.',
};

/**
 * Admin group page body. Reads from the joined `GroupViewData` shape so
 * the page server component stays focused on data fetching. Picks the
 * tab body based on `activeTab` and surfaces the read-only prompt on
 * mobile for tabs flagged in `MOBILE_BLOCKED_TABS`.
 */
export function GroupView({
  poolId,
  activeTab,
  crossGroupReceiptCount,
  data,
}: GroupViewProps) {
  const tabBlockedOnMobile = isMobileBlockedTab(activeTab);
  const tabLabel = TAB_LABEL[activeTab];
  const tabReason = MOBILE_BLOCKED_REASON[activeTab];

  const tabCounts = {
    members: data.members.length,
    cycles: data.cycles.length,
    payments: data.payments.length,
    receipts: data.receipts.length,
  };

  const tabBody = (() => {
    switch (activeTab) {
      case 'overview':
        return <GroupOverviewView overview={data.overview} />;
      case 'members':
        return <GroupMembersView rows={data.members} />;
      case 'cycles':
        return <GroupCyclesView rows={data.cycles} />;
      case 'payments':
        return <GroupPaymentsView rows={data.payments} />;
      case 'receipts':
        return (
          <GroupReceiptsView
            rows={data.receipts}
            crossGroupCount={crossGroupReceiptCount}
          />
        );
      case 'settings':
        return (
          <GroupSettingsView
            poolRows={data.settings.poolRows}
            whatsappGroupId={data.settings.whatsappGroupId}
            whatsappGroupLabel={data.settings.whatsappGroupLabel}
            whatsappActive={data.settings.whatsappActive}
            toggles={data.settings.toggles}
          />
        );
    }
  })();

  return (
    <main
      id="main-content"
      aria-labelledby="group-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <PoolGlyph
            initial={data.header.initial}
            swatch={data.header.swatch}
            size="md"
          />
          <div className="min-w-0">
            <p className="kicker-mono text-[10px]">
              Administration / {data.header.name}
            </p>
            <h1
              id="group-title"
              className="truncate text-[1.5rem] font-semibold tracking-tight text-d2-ink"
            >
              {data.header.name}
            </h1>
            <p className="truncate text-[13px] text-d2-ink/55">
              {data.header.metaLine}
            </p>
          </div>
        </div>
        {/* TODO(slice-5): wire WhatsApp deep-link handler here */}
        <button
          type="button"
          disabled
          aria-label="Open WhatsApp link — lands in slice 5"
          title="WhatsApp deep link lands in slice 5"
          className="inline-flex items-center gap-1.5 self-start rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              'color-mix(in oklch, var(--accent-whatsapp) 18%, transparent)',
            color: 'var(--accent-whatsapp)',
          }}
        >
          <MessageSquare size={13} aria-hidden="true" />
          WhatsApp link
        </button>
      </header>

      <GroupTabsNav poolId={poolId} active={activeTab} counts={tabCounts} />

      {tabBlockedOnMobile ? (
        <>
          <div className="md:hidden">
            <MobileReadonlyPrompt tabLabel={tabLabel} reason={tabReason} />
          </div>
          <div className="hidden md:block">{tabBody}</div>
        </>
      ) : (
        tabBody
      )}

      <p className="font-mono text-[11px] text-d2-ink/45">
        counts here are scoped to this group · sidebar Receipts ({crossGroupReceiptCount})
        is cross-group
      </p>
    </main>
  );
}
