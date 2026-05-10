// Super-admin desktop — Receipts (system-wide), Groups (list + detail),
// Admins (list + Add modal), WhatsApp links.
//
// Super-admin ≠ admin +1. Super-admin is the project-owner plane:
// creates groups, assigns admins, watches WhatsApp plumbing.
// Every tenant-wide table gets a distinct "super" chip so operators
// don't confuse a cross-tenant view with a scoped admin view.

const sBadge = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.06em',
  padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase',
  background: 'oklch(0.55 0.18 265 / 14%)', color: 'oklch(0.48 0.18 265)', fontWeight: 600,
};

function SuperChip({ children = 'system-wide' }) {
  return <span style={sBadge}><span style={{ width: 5, height: 5, borderRadius: 999, background: 'oklch(0.55 0.18 265)' }}/>{children}</span>;
}

// ─── Receipts · system-wide ────────────────────────────────────
function SD_Receipts() {
  const rows = [
    { gp: 'Lagos Rent Q2',   gpSq: 'a', admin: 'Ngozi O.',  from: 'Moyo I.',    amt: '₦ 12,000',  wa: '2h · WhatsApp',  waiting: '2h',  flag: null },
    { gp: 'ChamaSave · main',gpSq: 'd', admin: 'Ngozi O.',  from: 'Chioma E.',   amt: '₦ 8,500',   wa: '4h · WhatsApp',  waiting: '4h',  flag: null },
    { gp: 'Ibadan trip',     gpSq: 'c', admin: 'Bola A.',   from: 'Tola B.',     amt: '₦ 15,000',  wa: '5h · WhatsApp',  waiting: '5h',  flag: null },
    { gp: 'Family group',    gpSq: 'b', admin: 'Femi M.',   from: 'Yemi K.',     amt: '₦ 5,000',   wa: '1d · WhatsApp',  waiting: '1d',  flag: 'stale' },
    { gp: 'Ore Lagos',       gpSq: 'a', admin: 'Femi M.',   from: 'Dapo L.',     amt: '₦ 20,000',  wa: '2d · WhatsApp',  waiting: '2d',  flag: 'stale' },
    { gp: 'Eko Market',      gpSq: 'c', admin: '— unassigned',from: 'Ifeoma P.', amt: '₦ 6,000',   wa: '3d · WhatsApp',  waiting: '3d',  flag: 'no-admin' },
    { gp: 'Aba Collective',  gpSq: 'd', admin: 'Adanna U.',  from: 'Nnaemeka H.', amt: '₦ 10,000',  wa: '5h · WhatsApp',  waiting: '5h',  flag: null },
  ];
  return (
    <PPShell role="super_admin" current="receipts" title="Receipts queue" sub="47 awaiting across 14 groups · 6 admins" actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <SuperChip>system · all groups</SuperChip>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Admin: any ▾</button>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Oldest first ▾</button>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { k: 'Pending', v: '47',    d: 'across 14 groups' },
          { k: 'Stale · >24h', v: '6', d: 'oldest 3d', warn: true },
          { k: 'No admin assigned', v: '1', d: 'Eko Market', warn: true },
          { k: 'Confirmed · 7d', v: '142', d: 'by 5 admins' },
          { k: 'Auto-match rate', v: '78%', d: 'phone → member' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '12px 14px', borderColor: s.warn ? 'color-mix(in oklch, var(--ajo-outstanding) 35%, transparent)' : 'color-mix(in oklch, var(--d2-ink) 8%, transparent)' }}>
            <div className="kicker-mono" style={{ fontSize: '0.625rem', color: s.warn ? 'oklch(0.5 0.14 70)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{s.k}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 600, ...mono, marginTop: 2 }}>{s.v}</div>
            <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1.1fr 1fr 0.8fr 0.9fr 0.9fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span><input type="checkbox" readOnly/></span>
          <span>Group</span><span>Admin on duty</span><span>From</span><span>Amount</span><span>Submitted</span><span>Waiting</span><span></span>
        </div>
        {rows.map((r, i, arr) => (
          <div key={i} className="status-row" data-tone={r.flag === 'no-admin' ? 'out' : r.flag === 'stale' ? 'stale' : 'pending'} style={{
            display: 'grid', gridTemplateColumns: '24px 1.4fr 1.1fr 1fr 0.8fr 0.9fr 0.9fr auto', gap: 14,
            padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem',
            borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
          }}>
            <span><input type="checkbox" readOnly/></span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`pool-sq ${r.gpSq}`} style={{ width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>{r.gp[0]}</span>
              <span style={{ fontWeight: 500 }}>{r.gp}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: r.flag === 'no-admin' ? 'var(--destructive)' : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)', fontStyle: r.flag === 'no-admin' ? 'italic' : 'normal' }}>{r.admin}</span>
            <span>{r.from}</span>
            <span style={{ ...mono, fontWeight: 500 }}>{r.amt}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.wa}</span>
            <span style={{ ...mono, fontSize: '0.75rem', fontWeight: r.flag === 'stale' ? 600 : 400, color: r.flag === 'stale' ? 'var(--ajo-outstanding)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.waiting}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>Reassign</button>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>View</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
        super_admin view · does NOT confirm receipts directly — routes stragglers to admins. "No admin assigned" is the only actionable alarm here.
      </p>
    </PPShell>
  );
}

// ─── Groups · list ─────────────────────────────────────────────
function SD_Groups() {
  const groups = [
    { name: 'Lagos Rent Q2',     sq: 'a', mem: 5,  cyc: '10/12', cad: 'weekly',   cur: 'NGN', admin: 'Ngozi O.',  wa: 'linked',    pend: 3, health: 92 },
    { name: 'Ibadan Trip 2026',  sq: 'c', mem: 6,  cyc: '2/6',   cad: 'monthly',  cur: 'NGN', admin: 'Bola A.',   wa: 'linked',    pend: 1, health: 88 },
    { name: 'ChamaSave · main',  sq: 'd', mem: 12, cyc: '14/24', cad: 'weekly',   cur: 'NGN', admin: 'Ngozi O.',  wa: 'linked',    pend: 2, health: 95 },
    { name: 'Family group',      sq: 'b', mem: 8,  cyc: '6/8',   cad: 'monthly',  cur: 'NGN', admin: 'Femi M.',   wa: 'unlinked',  pend: 4, health: 71 },
    { name: 'Ore Lagos',         sq: 'a', mem: 10, cyc: '3/10',  cad: 'weekly',   cur: 'NGN', admin: 'Femi M.',   wa: 'linked',    pend: 0, health: 84 },
    { name: 'Eko Market',        sq: 'c', mem: 7,  cyc: '1/12',  cad: 'weekly',   cur: 'NGN', admin: '—',         wa: 'unlinked',  pend: 1, health: 40, orphan: true },
    { name: 'Aba Collective',    sq: 'd', mem: 14, cyc: '8/16',  cad: 'biweekly', cur: 'NGN', admin: 'Adanna U.', wa: 'linked',    pend: 2, health: 89 },
    { name: 'Port Harcourt Co.', sq: 'b', mem: 5,  cyc: '4/6',   cad: 'monthly',  cur: 'NGN', admin: 'Bola A.',   wa: 'pending',   pend: 0, health: 78 },
  ];
  return (
    <PPShell role="super_admin" current="sys-groups" crumbs="System" title="Groups" sub="14 groups · 6 admins · 2 unlinked from WhatsApp" actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <SuperChip/>
        <div style={{ position: 'relative' }}>
          <Lu name="Search" size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}/>
          <input readOnly placeholder="Search groups…" style={{ padding: '7px 12px 7px 28px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 5%, transparent)', border: 'none', fontSize: '0.8125rem', width: 180 }}/>
        </div>
        <button style={{ padding: '7px 14px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Lu name="Plus" size={13}/> New group
        </button>
      </div>
    }>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.8fr 0.8fr 1fr 0.9fr 0.8fr 0.7fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>Group</span><span>Members</span><span>Cycles</span><span>Cadence</span><span>Admin</span><span>WhatsApp</span><span>Pending</span><span>Health</span><span></span>
        </div>
        {groups.map((g, i) => (
          <div key={i} className="status-row" data-tone={g.orphan ? 'orphan' : g.health < 60 ? 'out' : g.health < 85 ? 'pending' : 'paid'} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.8fr 0.8fr 1fr 0.9fr 0.8fr 0.7fr auto', gap: 14,
            padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem',
            borderBottom: i < groups.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={`pool-sq ${g.sq}`} style={{ width: 26, height: 26, borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{g.name[0]}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{g.name}</div>
                <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{g.cur}</div>
              </div>
            </div>
            <span style={{ ...mono, fontSize: '0.75rem' }}>{g.mem}</span>
            <span style={{ ...mono, fontSize: '0.75rem' }}>{g.cyc}</span>
            <span style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' }}>{g.cad}</span>
            <span style={{ fontSize: '0.75rem', color: g.admin === '—' ? 'var(--destructive)' : 'var(--d2-ink)', fontStyle: g.admin === '—' ? 'italic' : 'normal' }}>{g.admin === '—' ? 'unassigned' : g.admin}</span>
            <Pill tone={g.wa === 'linked' ? 'paid' : g.wa === 'pending' ? 'pending' : 'out'}>{g.wa}</Pill>
            <span style={{ ...mono, fontSize: '0.75rem', fontWeight: g.pend > 2 ? 600 : 400, color: g.pend > 2 ? 'var(--ajo-outstanding)' : g.pend > 0 ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}>
              {g.pend || '—'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 42, height: 5, borderRadius: 3, background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${g.health}%`, background: g.health > 85 ? 'var(--ajo-paid)' : g.health > 60 ? 'var(--ajo-outstanding)' : 'var(--destructive)', borderRadius: 3 }}/>
              </div>
              <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>{g.health}</span>
            </div>
            <Lu name="ChevronRight" size={14} style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}/>
          </div>
        ))}
      </div>
      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
        "unassigned" + "unlinked" are orphan states — super-admin should resolve or archive.
      </p>
    </PPShell>
  );
}

// ─── Groups · detail (super-admin view of a group) ─────────────
function SD_GroupDetail() {
  return (
    <PPShell role="super_admin" current="sys-groups" crumbs="System / Groups" title="Lagos Rent Q2" sub="group_id · grp_01HXV4K9 · created 12 Jan 2026 by Ngozi O." actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <SuperChip>system view</SuperChip>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Open as admin</button>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ ...card, padding: '18px 20px' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 10 }}>Group record</div>
          {[
            ['Name',             'Lagos Rent Q2'],
            ['Group ID',         'grp_01HXV4K9ABC', true],
            ['Currency',         'NGN · Nigerian naira'],
            ['Cadence',          'weekly · Fri'],
            ['Contribution',     '₦ 12,000'],
            ['Members',          '5 · (Adaeze · Kola · Moyo · Ngozi · Tola)'],
            ['Created',          '12 Jan 2026'],
            ['Status',           <Pill tone="paid" key="a">active</Pill>],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, padding: '9px 0', fontSize: '0.8125rem', borderTop: i > 0 ? hair : 'none', alignItems: 'center' }}>
              <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r[0]}</span>
              <span style={{ ...(r[2] ? mono : {}), fontSize: r[2] ? '0.75rem' : '0.8125rem' }}>{r[1]}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '18px 20px' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 10 }}>Assignments</div>

          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--d2-warm-bg)', border: hair, marginBottom: 10 }}>
            <div style={{ fontSize: '0.6875rem', ...mono, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 4 }}>ADMIN ON DUTY</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--d2-coral)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>N</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ngozi Okoye</div>
                <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>ngozi@chamasave.ng · 3 groups</div>
              </div>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>Reassign</button>
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--d2-warm-bg)', border: hair, marginBottom: 10 }}>
            <div style={{ fontSize: '0.6875rem', ...mono, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 4 }}>WHATSAPP</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--ajo-paid)' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Linked · Lagos Rent Q2</div>
                <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>wa_group_id · 120363…4492 · bot active</div>
              </div>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>Unlink</button>
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--destructive) 8%, transparent)', border: '1px solid color-mix(in oklch, var(--destructive) 25%, transparent)', marginTop: 14 }}>
            <div style={{ fontSize: '0.6875rem', ...mono, color: 'var(--destructive)', marginBottom: 4 }}>DANGER</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'transparent', border: '1px solid color-mix(in oklch, var(--destructive) 30%, transparent)', color: 'var(--destructive)', fontSize: '0.75rem', fontWeight: 500 }}>Archive group</button>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--destructive)', color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Audit trail · group events</h3>
          <span className="kicker-mono" style={{ fontSize: '0.625rem' }}>last 10 · all events in Activity</span>
        </div>
        {[
          { w: '1h',  who: 'Ngozi O.', act: 'confirmed receipt · ₦ 12,000 from Adaeze' },
          { w: '4h',  who: 'bot',      act: 'matched WhatsApp msg → member Moyo I.' },
          { w: '1d',  who: 'you',      act: 'reassigned admin to Ngozi (was Femi)' },
          { w: '1w',  who: 'system',   act: 'payout ₦ 96,000 released → Kola' },
          { w: '2w',  who: 'Ngozi O.', act: 'added Tola B. to rotation · position 5' },
          { w: '3mo', who: 'you',      act: 'created group · initial admin Femi M.' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 100px 1fr', gap: 12, padding: '8px 0', fontSize: '0.8125rem', borderTop: i > 0 ? '1px solid color-mix(in oklch, var(--d2-ink) 5%, transparent)' : 'none' }}>
            <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{a.w}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: a.who === 'bot' || a.who === 'system' ? 'oklch(0.55 0.18 265)' : 'var(--d2-ink)' }}>{a.who}</span>
            <span style={{ color: 'color-mix(in oklch, var(--d2-ink) 75%, transparent)' }}>{a.act}</span>
          </div>
        ))}
      </div>
    </PPShell>
  );
}

// ─── Admins · list (+ Add modal) ───────────────────────────────
function SD_Admins({ withModal = false }) {
  const admins = [
    { n: 'Ngozi Okoye',   e: 'ngozi@chamasave.ng',   phone: '+234 803 456 7890', groups: ['Lagos Rent Q2', 'ChamaSave · main'], active: true,  last: '2h ago', grants: 3 },
    { n: 'Bola Adebayo',  e: 'bola@chamasave.ng',    phone: '+234 806 221 9987', groups: ['Ibadan Trip', 'Port Harcourt Co.'],  active: true,  last: '1d ago', grants: 2 },
    { n: 'Femi Martins',  e: 'femi@chamasave.ng',    phone: '+234 812 004 1200', groups: ['Family group', 'Ore Lagos'],         active: true,  last: '3d ago', grants: 2 },
    { n: 'Adanna Uche',   e: 'adanna@chamasave.ng',  phone: '+234 909 881 2210', groups: ['Aba Collective'],                    active: true,  last: '5h ago', grants: 1 },
    { n: 'Chidi Obi',     e: 'chidi@chamasave.ng',   phone: '+234 803 552 6612', groups: [],                                    active: false, last: '2w ago', grants: 0 },
  ];
  return (
    <PPShell role="super_admin" current="sys-admins" crumbs="System" title="Admins" sub="5 admins · 1 inactive · 8 grants total" actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <SuperChip/>
        <button style={{ padding: '7px 14px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Lu name="Plus" size={13}/> Add admin
        </button>
      </div>
    }>
      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'oklch(0.55 0.18 265 / 6%)', border: '1px solid oklch(0.55 0.18 265 / 18%)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Lu name="Info" size={15} style={{ color: 'oklch(0.48 0.18 265)' }}/>
        <div style={{ fontSize: '0.8125rem', color: 'oklch(0.40 0.14 265)' }}>
          Admins are created in-app (no SMTP yet) — you'll get a <b>temp password</b> shown once. Share it out-of-band; they rotate on first sign-in.
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 2fr 0.8fr 0.8fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>Admin</span><span>Phone</span><span>Groups granted</span><span>Last seen</span><span>Status</span><span></span>
        </div>
        {admins.map((a, i, arr) => (
          <div key={i} className="status-row" data-tone={a.active ? 'paid' : 'inactive'} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 2fr 0.8fr 0.8fr auto', gap: 14, padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, background: a.active ? 'var(--d2-coral)' : 'color-mix(in oklch, var(--d2-ink) 15%, transparent)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{a.n[0]}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{a.n}</div>
                <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{a.e}</div>
              </div>
            </div>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' }}>{a.phone}</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {a.groups.length === 0
                ? <span style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)', fontStyle: 'italic' }}>no grants</span>
                : a.groups.map((g, j) => <Pill key={j} tone="muted" mono={false}>{g}</Pill>)
              }
            </div>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{a.last}</span>
            <Pill tone={a.active ? 'paid' : 'muted'}>{a.active ? 'active' : 'inactive'}</Pill>
            <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>Manage</button>
          </div>
        ))}
      </div>

      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
        admins are scoped to the groups you grant them · revoking all grants does NOT delete the account
      </p>

      {withModal && <AddAdminModal/>}
    </PPShell>
  );
}

function AddAdminModal() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in oklch, #000 35%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
      <div style={{ width: 560, background: 'var(--d2-warm-bg)', borderRadius: 16, border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: hair, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Add admin</div>
            <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', marginTop: 2 }}>Create the account <em>and</em> grant groups in one step · atomic</div>
          </div>
          <button style={{ width: 26, height: 26, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lu name="X" size={16} style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}/>
          </button>
        </div>

        <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Full name" placeholder="e.g. Chidi Obi"/>
          <Field label="Email" placeholder="chidi@chamasave.ng" mono/>
          <Field label="Phone (WhatsApp)" placeholder="+234 …" mono/>
          <Field label="Role" value="admin" muted/>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 6 }}>
              Grant groups <span style={{ textTransform: 'none', letterSpacing: 0, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>· admin can confirm receipts in these</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 10, background: 'var(--d2-cream)', border: hair, minHeight: 48 }}>
              <GroupChip active>Lagos Rent Q2</GroupChip>
              <GroupChip active>Ore Lagos</GroupChip>
              <GroupChip>Ibadan Trip</GroupChip>
              <GroupChip>Family group</GroupChip>
              <GroupChip>ChamaSave · main</GroupChip>
              <GroupChip>Aba Collective</GroupChip>
              <GroupChip>Port Harcourt Co.</GroupChip>
              <GroupChip>Eko Market</GroupChip>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', padding: '12px 14px', borderRadius: 10, background: 'oklch(0.55 0.18 265 / 8%)', border: '1px solid oklch(0.55 0.18 265 / 18%)', display: 'flex', gap: 10 }}>
            <Lu name="KeyRound" size={15} style={{ color: 'oklch(0.48 0.18 265)', flexShrink: 0, marginTop: 2 }}/>
            <div style={{ fontSize: '0.8125rem', color: 'oklch(0.40 0.14 265)' }}>
              After creating, a <b>temp password</b> appears once on the next screen. Copy it — we don't store it and can't re-show it. They'll rotate on first sign-in.
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: hair, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--d2-cream)' }}>
          <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>no email sent · deliver creds out-of-band</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', fontSize: '0.8125rem', fontWeight: 500 }}>Cancel</button>
            <button style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Lu name="UserPlus" size={13}/> Create & grant · reveal temp password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, mono: isMono, muted }) {
  return (
    <div>
      <div style={{ ...mono, fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 4 }}>{label}</div>
      <div style={{ padding: '9px 12px', borderRadius: 10, background: muted ? 'color-mix(in oklch, var(--d2-ink) 5%, transparent)' : 'var(--d2-cream)', border: hair, fontSize: '0.875rem', ...(isMono ? mono : {}), color: value ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 45%, transparent)' }}>
        {value || placeholder}
      </div>
    </div>
  );
}

function GroupChip({ children, active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 500,
      background: active ? 'var(--d2-accent-soft)' : 'color-mix(in oklch, var(--d2-ink) 5%, transparent)',
      color: active ? 'var(--d2-accent)' : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
      border: active ? '1px solid color-mix(in oklch, var(--d2-accent) 30%, transparent)' : '1px solid transparent',
    }}>
      {active && <Lu name="Check" size={11}/>}
      {children}
    </span>
  );
}

// ─── WhatsApp links ────────────────────────────────────────────
function SD_WhatsApp() {
  const links = [
    { gp: 'Lagos Rent Q2',    sq: 'a', wa: 'Lagos Rent Q2',       waId: '120363…4492', members: '5/5',  matched: '5/5', bot: 'active', last: '2h ago', st: 'healthy' },
    { gp: 'ChamaSave · main', sq: 'd', wa: 'ChamaSave',           waId: '120363…8871', members: '12/12', matched: '11/12', bot: 'active', last: '4h ago', st: 'healthy' },
    { gp: 'Ibadan Trip 2026', sq: 'c', wa: 'Ibadan 2026',         waId: '120363…1103', members: '6/6',  matched: '6/6',  bot: 'active', last: '5h ago', st: 'healthy' },
    { gp: 'Ore Lagos',        sq: 'a', wa: 'Ore Lagos chat',      waId: '120363…2277', members: '10/10', matched: '8/10', bot: 'active', last: '1d ago', st: 'drift' },
    { gp: 'Aba Collective',   sq: 'd', wa: 'Aba · savings',       waId: '120363…5566', members: '14/14', matched: '14/14', bot: 'active', last: '5h ago', st: 'healthy' },
    { gp: 'Port Harcourt Co.', sq: 'b', wa: '—',                   waId: '—',           members: '5/5',  matched: '—',    bot: 'pending', last: '—',     st: 'pending' },
    { gp: 'Family group',     sq: 'b', wa: '—',                   waId: '—',           members: '8/8',  matched: '—',    bot: 'unlinked', last: '—',     st: 'unlinked' },
    { gp: 'Eko Market',       sq: 'c', wa: '—',                   waId: '—',           members: '7/7',  matched: '—',    bot: 'unlinked', last: '—',     st: 'unlinked' },
  ];
  const stTone = { healthy: 'linked', drift: 'drift', pending: 'pending', unlinked: 'unlinked' };
  return (
    <PPShell role="super_admin" current="sys-wa" crumbs="System" title="WhatsApp links" sub="14 groups · 5 linked · 1 pending · 2 unlinked · bot online" actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <SuperChip>plumbing</SuperChip>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Lu name="RefreshCw" size={13}/> Re-scan members
        </button>
      </div>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 8, background: 'oklch(0.72 0.16 152)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lu name="MessageSquare" size={16}/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>PoolPay bot</div>
              <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>+234 700 POOL PAY · 5 group chats · last event 2h ago</div>
            </div>
            <Pill tone="paid">online</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
            {[
              { k: 'Ingested · 7d', v: '186' },
              { k: 'Matched by phone', v: '78%' },
              { k: 'Needs admin', v: '47' },
              { k: 'Avg ack time', v: '4.2m' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '9px 10px', borderRadius: 8, background: 'var(--d2-cream)' }}>
                <div style={{ ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{s.k}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, ...mono }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: '16px 18px' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 10 }}>How the link is made</div>
          <ol style={{ margin: 0, padding: '0 0 0 18px', fontSize: '0.8125rem', lineHeight: 1.7, color: 'color-mix(in oklch, var(--d2-ink) 75%, transparent)' }}>
            <li>Super-admin invites <span style={{ ...mono, fontSize: '0.75rem' }}>+234 700 POOL PAY</span> to the group chat</li>
            <li>Bot posts a one-time code · admin replies <span style={{ ...mono, fontSize: '0.75rem' }}>/link &lt;code&gt;</span></li>
            <li>Members whose phone matches a PoolPay member auto-link</li>
            <li>Bot marks receipts; a human admin confirms</li>
          </ol>
        </div>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.2fr 0.8fr 0.9fr 0.9fr 0.9fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>PoolPay group</span><span>WhatsApp chat</span><span>wa_group_id</span><span>Members</span><span>Phone matched</span><span>Last event</span><span>Status</span><span></span>
        </div>
        {links.map((l, i, arr) => (
          <div key={i} className="status-row" data-tone={l.st === 'healthy' ? 'linked' : l.st} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.2fr 0.8fr 0.9fr 0.9fr 0.9fr auto', gap: 14,
            padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem',
            borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`pool-sq ${l.sq}`} style={{ width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>{l.gp[0]}</span>
              <span style={{ fontWeight: 500 }}>{l.gp}</span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: l.wa === '—' ? 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' : 'var(--d2-ink)', fontStyle: l.wa === '—' ? 'italic' : 'normal' }}>{l.wa === '—' ? 'not linked' : l.wa}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{l.waId}</span>
            <span style={{ ...mono, fontSize: '0.75rem' }}>{l.members}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: l.matched !== '—' && parseInt(l.matched) < parseInt(l.members) ? 'var(--ajo-outstanding)' : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' }}>{l.matched}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{l.last}</span>
            <Pill tone={l.st === 'healthy' ? 'paid' : l.st === 'drift' ? 'pending' : l.st === 'pending' ? 'pending' : 'out'}>{l.st}</Pill>
            <button style={{ padding: '6px 10px', borderRadius: 8, background: l.st === 'unlinked' || l.st === 'pending' ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', color: l.st === 'unlinked' || l.st === 'pending' ? 'var(--d2-warm-bg)' : 'var(--d2-ink)', fontSize: '0.75rem', fontWeight: 500 }}>
              {l.st === 'unlinked' ? 'Link' : l.st === 'pending' ? 'Resend code' : 'Manage'}
            </button>
          </div>
        ))}
      </div>

      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
        phone-match drift (Ore Lagos 8/10) means 2 members changed numbers or never joined chat · nudge them
      </p>
    </PPShell>
  );
}

Object.assign(window, { SD_Receipts, SD_Groups, SD_GroupDetail, SD_Admins, SD_WhatsApp });
