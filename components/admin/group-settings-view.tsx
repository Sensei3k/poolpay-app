export interface GroupSettingsRow {
  kicker: string;
  value: string;
}

export interface GroupSettingsViewProps {
  /** Pool-meta rows shown in the left "Group" card. */
  poolRows: ReadonlyArray<GroupSettingsRow>;
  /** Pre-formatted WhatsApp group id (or "-" when unlinked). */
  whatsappGroupId: string;
  whatsappGroupLabel: string;
  /** Whether the bot is currently active for this group. */
  whatsappActive: boolean;
  /** Initial state of the two toggles, slice 5 wires the on-change handlers. */
  toggles: {
    autoNudge: boolean;
    allowUnlinkedReceipts: boolean;
  };
}

interface ToggleProps {
  label: string;
  detail: string;
  checked: boolean;
}

function StaticToggle({ label, detail, checked }: ToggleProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-2">
      <div className="min-w-0">
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-[11px] text-ink/55">{detail}</div>
      </div>
      {/* TODO(slice-5): wire toggle change handler here */}
      <span
        role="switch"
        aria-checked={checked}
        aria-disabled="true"
        className="relative inline-block h-6 w-10 shrink-0 rounded-full"
        style={{
          background: checked
            ? 'var(--accent-primary)'
            : 'color-mix(in oklch, var(--ink) 12%, transparent)',
        }}
      >
        <span
          aria-hidden="true"
          className="absolute top-[2px] block h-5 w-5 rounded-full bg-white transition-all"
          style={{
            left: checked ? 'auto' : '2px',
            right: checked ? '2px' : 'auto',
          }}
        />
      </span>
    </div>
  );
}

/**
 * Settings tab body. Desktop-only, the mobile path renders the
 * read-only prompt. Two cards: pool meta (left), receipts + WhatsApp
 * (right) with a danger-zone footer.
 *
 * Edit + toggle handlers (and the "Close group" destructive flow) land
 * in slice 5.
 */
export function GroupSettingsView({
  poolRows,
  whatsappGroupId,
  whatsappGroupLabel,
  whatsappActive,
  toggles,
}: GroupSettingsViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      <section
        aria-labelledby="settings-group-title"
        className="rounded-[14px] border bg-surface-card p-4 md:p-5"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <h3 id="settings-group-title" className="kicker-mono mb-3 text-[10px]">
          Group
        </h3>
        <dl>
          {poolRows.map((row, i) => (
            <div
              key={row.kicker}
              className="grid grid-cols-[120px_1fr_auto] items-center gap-2 py-2 text-[13px]"
              style={{
                borderTop:
                  i > 0
                    ? '1px solid color-mix(in oklch, var(--ink) 7%, transparent)'
                    : 'none',
              }}
            >
              <dt className="font-mono text-[12px] text-ink/55">
                {row.kicker}
              </dt>
              <dd>{row.value}</dd>
              {/* TODO(slice-5): wire editFieldAction here */}
              <button
                type="button"
                disabled
                aria-label={`Edit ${row.kicker} (coming soon)`}
                className="text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: 'var(--accent-primary)' }}
              >
                Edit
              </button>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="settings-wa-title"
        className="rounded-[14px] border bg-surface-card p-4 md:p-5"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <h3 id="settings-wa-title" className="kicker-mono mb-3 text-[10px]">
          Receipts &amp; WhatsApp
        </h3>
        <div
          className="mb-3 rounded-lg border p-3"
          style={{
            background: 'var(--surface-page)',
            borderColor:
              'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <div className="kicker-mono text-[10px]">Linked WhatsApp group</div>
          <div className="mt-0.5 flex items-center gap-2 text-[14px] font-medium">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: whatsappActive
                  ? 'var(--status-paid)'
                  : 'color-mix(in oklch, var(--ink) 25%, transparent)',
              }}
            />
            {whatsappGroupLabel}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-ink/55">
            {whatsappGroupId} ·{' '}
            {whatsappActive ? 'bot active' : 'bot inactive'}
          </div>
        </div>

        <StaticToggle
          label="Auto-nudge at cycle open"
          detail={'Bot posts "Cycle N open · pay by [date]"'}
          checked={toggles.autoNudge}
        />
        <div
          style={{
            borderTop:
              '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <StaticToggle
            label="Allow receipts from un-linked members"
            detail="If off, bot only matches by phone"
            checked={toggles.allowUnlinkedReceipts}
          />
        </div>

        <div
          className="mt-4 pt-3.5"
          style={{
            borderTop:
              '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <p
            className="kicker-mono mb-2 text-[10px]"
            style={{ color: 'var(--destructive)' }}
          >
            Danger
          </p>
          {/* TODO(slice-5): wire closeGroupAction here */}
          <button
            type="button"
            disabled
            aria-label="Close group (coming soon)"
            title="Coming soon"
            className="text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
            style={{ color: 'var(--destructive)' }}
          >
            Close group (archive cycles)
          </button>
        </div>
      </section>
    </div>
  );
}
