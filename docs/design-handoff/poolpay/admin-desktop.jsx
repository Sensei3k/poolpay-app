// Admin desktop (scoped) — Receipts queue, Empty state, Group page w/ 6 tabs

function Pill({ tone, children, mono: isMono = true }) {
  const bg = {
    paid:    'var(--ajo-paid-subtle)',
    pending: 'var(--ajo-outstanding-subtle)',
    out:     'color-mix(in oklch, var(--destructive) 12%, transparent)',
    accent:  'var(--d2-accent-soft)',
    muted:   'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
  }[tone];
  const fg = {
    paid:    'var(--ajo-paid)',
    pending: 'oklch(0.5 0.14 70)',
    out:     'var(--destructive)',
    accent:  'var(--d2-accent)',
    muted:   'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
  }[tone];
  return <span style={{
    ...(isMono ? mono : {}), fontSize: '0.625rem', padding: '2px 7px', borderRadius: 999,
    background: bg, color: fg, fontWeight: 500, whiteSpace: 'nowrap',
  }}>{children}</span>;
}

// ─── Receipts queue (the admin's home, when non-empty) ─────────
function AD_Receipts() {
  const rows = [
    { gp: 'Lagos Rent Q2',   gpSq: 'a', from: 'Moyo I.',     amt: '₦ 12,000', cycle: 'cycle 10 · w10',  wa: '2h ago · WhatsApp', note: 'PIC of transfer + "sent"', tone: 'pending' },
    { gp: 'Lagos Rent Q2',   gpSq: 'a', from: 'Adaeze O.',    amt: '₦ 12,000', cycle: 'cycle 10 · w10',  wa: '3h ago · WhatsApp', note: '"Paid"', tone: 'pending' },
    { gp: 'ChamaSave · main',gpSq: 'd', from: 'Chioma E.',    amt: '₦ 8,500',  cycle: 'cycle 14 · w14',  wa: '4h ago · WhatsApp', note: 'screenshot', tone: 'pending' },
    { gp: 'Ibadan trip',     gpSq: 'c', from: 'Tola B.',      amt: '₦ 15,000', cycle: 'cycle 2 · Apr',   wa: '5h ago · WhatsApp', note: 'forwarded bank alert', tone: 'pending' },
    { gp: 'Family group',    gpSq: 'b', from: 'Yemi K.',      amt: '₦ 5,000',  cycle: 'cycle 6 · Feb',   wa: '1d ago · WhatsApp', note: 'no attachment', tone: 'stale' },
    { gp: 'Lagos Rent Q2',   gpSq: 'a', from: 'Kola A.',      amt: '₦ 12,000', cycle: 'cycle 10 · w10',  wa: '1d ago · WhatsApp', note: '"Done"', tone: 'stale' },
  ];
  return (
    <PPShell role="admin" current="receipts" title="Receipts queue" sub="12 awaiting review across 3 groups you admin" actions={
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>All groups ▾</button>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Oldest first ▾</button>
      </div>
    }>
      {/* Signal row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { k: 'Awaiting you', v: '12',      tone: 'pending' },
          { k: 'Today',        v: '4',        tone: 'muted' },
          { k: 'Oldest',       v: '2d',       tone: 'out' },
          { k: 'Confirmed · this wk', v: '38', tone: 'paid' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '12px 14px' }}>
            <div className="kicker-mono" style={{ fontSize: '0.625rem' }}>{s.k}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 600, ...mono, marginTop: 2 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {/* header */}
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1.2fr 0.8fr 1fr 1.1fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span><input type="checkbox" readOnly/></span>
          <span>Group · cycle</span>
          <span>From</span>
          <span>Amount</span>
          <span>Submitted</span>
          <span>Note</span>
          <span>Action</span>
        </div>
        {rows.map((r, i, arr) => (
          <div key={i} className="status-row" data-tone={r.tone} style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1.2fr 0.8fr 1fr 1.1fr auto', gap: 14, padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span><input type="checkbox" readOnly/></span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`pool-sq ${r.gpSq}`} style={{ width: 22, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>{r.gp[0]}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>{r.gp}</div>
                <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.cycle}</div>
              </div>
            </div>
            <div>
              <div>{r.from}</div>
              <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>+234 803 ···</div>
            </div>
            <span style={{ ...mono, fontWeight: 500 }}>{r.amt}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.wa}</span>
            <span style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--ajo-paid)', color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>Confirm</button>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>View</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
        you landed here because `router.get_admin_home` saw pending_receipts &gt; 0 for your groups · once the queue is empty you'll drop to member home
      </p>
    </PPShell>
  );
}

// ─── Empty queue · admin drops to member home with a pill ──────
function AD_Empty() {
  return (
    <PPShell role="admin" current="home" pendingCount={0} title="Home" sub="Thursday, 22 Apr · queue is clear">
      <div style={{ ...card, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ajo-paid-subtle)', border: '1px solid color-mix(in oklch, var(--ajo-paid) 30%, transparent)' }}>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ajo-paid)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Lu name="Check" size={15}/></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ajo-paid)' }}>Receipts queue is empty</div>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>No pending submissions across your 3 groups — you're seeing this as a member now. Receipts link stays available in the sidebar.</div>
        </div>
        <button style={{ padding: '7px 12px', borderRadius: 8, background: 'transparent', border: '1px solid color-mix(in oklch, var(--ajo-paid) 40%, transparent)', color: 'var(--ajo-paid)', fontSize: '0.75rem', fontWeight: 500 }}>Confirmed history →</button>
      </div>
      {/* Reuse member home body (inlined, smaller) */}
      <div className="hero-head">
        <div>
          <p className="hero-k">This month</p>
          <h1 className="hero-t">You're on track to collect<br/><span className="strong">₦ 428,500</span> across 4 pools.</h1>
        </div>
      </div>
      <div className="cards3">
        <div className="card"><span className="card-k"><Lu name="TrendingUp" size={12}/> Collected</span><span className="card-v">₦ 248,600</span><span className="card-d">62% of April target</span></div>
        <div className="card"><span className="card-k"><Lu name="Clock" size={12}/> Outstanding</span><span className="card-v">₦ 62,000</span><span className="card-d">3 contributions pending</span></div>
        <div className="card"><span className="card-k"><Lu name="HandCoins" size={12}/> Next payout</span><span className="card-v">₦ 18,500</span><span className="card-d">Fri 25 Apr</span></div>
      </div>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.75rem' }}>Your pools</h3>
      <div className="pools-grid">
        {[
          { sq: 'a', name: 'Lagos Rent Q2', sub: 'weekly · 10/12', pct: 83, val: '₦ 84,000', foot: 'on track' },
          { sq: 'b', name: 'Family group · Feb', sub: 'monthly · 6/8', pct: 75, val: '₦ 32,500', foot: '8 members' },
          { sq: 'c', name: 'Ibadan trip 2026', sub: 'monthly · 2/6', pct: 33, val: '₦ 18,000', foot: 'due Fri' },
          { sq: 'd', name: 'ChamaSave · main', sub: 'weekly', pct: 60, val: '₦ 96,100', foot: '12 members' },
        ].map((p, i) => (
          <div className="pool" key={i}>
            <div className="pool-top">
              <span className={`pool-sq ${p.sq}`}>{p.name[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div className="pool-ttl">{p.name}</div><div className="pool-sub">{p.sub}</div></div>
              <Lu name="ChevronRight" size={16} style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}/>
            </div>
            <div className="pool-bar"><span style={{ width: `${p.pct}%` }}/></div>
            <div className="pool-foot"><span style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{p.foot}</span><span className="val">{p.val}</span></div>
          </div>
        ))}
      </div>
    </PPShell>
  );
}

// ─── Group page · 6 tabs ──────────────────────────────────────
function AD_Group({ tab = 'overview' }) {
  const TABS = [
    { id: 'overview', l: 'Overview', count: null },
    { id: 'members',  l: 'Members',  count: 5 },
    { id: 'cycles',   l: 'Cycles',   count: 12 },
    { id: 'payments', l: 'Payments', count: 47 },
    { id: 'receipts', l: 'Receipts', count: 3, hot: true },
    { id: 'settings', l: 'Settings', count: null },
  ];

  return (
    <PPShell role="admin" current="lagos-rent-q2" crumbs="Administration / Lagos Rent Q2" title="Lagos Rent Q2" sub="Weekly · NGN · 5 members · you admin this group" actions={
      <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Lu name="MessageSquare" size={13}/> WhatsApp link
      </button>
    }>
      {/* Group tab bar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: hair, marginBottom: 18, padding: '0 2px' }}>
        {TABS.map(t => {
          const on = t.id === tab;
          return (
            <div key={t.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 12px',
              fontSize: '0.8125rem', fontWeight: on ? 600 : 500,
              color: on ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
              borderBottom: on ? '2px solid var(--d2-ink)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {t.l}
              {t.count != null && <span style={{ ...mono, fontSize: '0.625rem', padding: '1px 6px', borderRadius: 4,
                background: t.hot ? 'var(--ajo-outstanding-subtle)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                color:      t.hot ? 'oklch(0.5 0.14 70)'            : 'color-mix(in oklch, var(--d2-ink) 65%, transparent)',
                fontWeight: 500,
              }}>{t.count}</span>}
            </div>
          );
        })}
      </div>

      {tab === 'overview'  && <AD_Group_Overview/>}
      {tab === 'members'   && <AD_Group_Members/>}
      {tab === 'cycles'    && <AD_Group_Cycles/>}
      {tab === 'payments'  && <AD_Group_Payments/>}
      {tab === 'receipts'  && <AD_Group_Receipts/>}
      {tab === 'settings'  && <AD_Group_Settings/>}

      <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 20 }}>
        counts here are scoped to this group · sidebar Receipts (12) is cross-group
      </p>
    </PPShell>
  );
}

function AD_Group_Overview() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { k: 'Pool balance', v: '₦ 84,000', d: 'available · cycle 10 open' },
          { k: 'Collected · cycle 10', v: '₦ 36k / 60k', d: '3 of 5 paid' },
          { k: 'Next payout', v: '₦ 96,000', d: 'w13 → you' },
          { k: 'Health', v: '92%', d: '1 member overdue' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '14px 16px' }}>
            <div className="kicker-mono" style={{ fontSize: '0.625rem' }}>{s.k}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 600, ...mono, margin: '2px 0' }}>{s.v}</div>
            <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Cycles timeline</h3>
            <span className="kicker-mono" style={{ fontSize: '0.625rem' }}>12 total · 1 open</span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} style={{ flex: 1, padding: 8, borderRadius: 6,
                background: i < 9 ? 'var(--ajo-paid-subtle)' : i === 9 ? 'var(--ajo-outstanding-subtle)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                border: i === 9 ? '1.5px solid var(--ajo-outstanding)' : 'none',
                textAlign: 'center', ...mono, fontSize: '0.625rem',
                color: i < 9 ? 'var(--ajo-paid)' : i === 9 ? 'oklch(0.5 0.14 70)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
              }}>w{i+1}</div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>
            Rotation order: Adaeze → Kola → Moyo → <span style={{ color: 'var(--d2-ink)', fontWeight: 600 }}>You (w13)</span> → Tola
          </div>
        </div>

        <div style={{ ...card, padding: '16px 18px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 12px' }}>Recent activity</h3>
          {[
            { ico: 'Check',      t: 'You confirmed ₦ 12,000 from Adaeze', w: '1h' },
            { ico: 'MessageSquare', t: 'Moyo submitted receipt', w: '2h' },
            { ico: 'HandCoins', t: 'Payout ₦ 96,000 → Kola', w: '1w' },
            { ico: 'UserPlus',  t: 'Tola joined', w: '2w' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', fontSize: '0.8125rem' }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lu name={a.ico} size={12}/>
              </span>
              <span style={{ flex: 1 }}>{a.t}</span>
              <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{a.w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AD_Group_Members() {
  const rows = [
    { n: 'Adaeze O.',  phone: '+234 803 111 0001', joined: 'Jan 2026',  pos: 1,  paid: 9, miss: 0,   due: '₦ 0',       st: 'ok' },
    { n: 'Kola A.',    phone: '+234 803 111 0002', joined: 'Jan 2026',  pos: 2,  paid: 9, miss: 0,   due: '₦ 0',       st: 'ok' },
    { n: 'Moyo I.',    phone: '+234 803 111 0003', joined: 'Jan 2026',  pos: 3,  paid: 8, miss: 1,   due: 'pending',   st: 'pending' },
    { n: 'You',        phone: '+234 803 456 7890', joined: 'Jan 2026',  pos: 4,  paid: 9, miss: 0,   due: '₦ 0',       st: 'ok' },
    { n: 'Tola B.',    phone: '+234 803 111 0005', joined: 'Mar 2026',  pos: 5,  paid: 6, miss: 2,   due: '₦ 12,000',  st: 'out' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Members · 5</h3>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Rotation order determines payout week</div>
        </div>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Lu name="Plus" size={13}/> Invite member
        </button>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1.6fr 1.3fr 0.6fr 1.1fr 0.8fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>#</span><span>Member</span><span>Phone · joined</span><span>Paid</span><span>Due</span><span>Status</span><span></span>
        </div>
        {rows.map((m, i, arr) => (
          <div key={i} className="status-row" data-tone={m.st === 'ok' ? null : m.st === 'pending' ? 'pending' : 'out'} style={{ display: 'grid', gridTemplateColumns: '24px 1.6fr 1.3fr 0.6fr 1.1fr 0.8fr auto', gap: 14, padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span style={{ ...mono, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{m.pos}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--d2-coral)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{m.n[0]}</span>
              <span style={{ fontWeight: 500 }}>{m.n}</span>
            </div>
            <div>
              <div style={{ ...mono, fontSize: '0.75rem' }}>{m.phone}</div>
              <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>joined {m.joined}</div>
            </div>
            <span style={{ ...mono, fontSize: '0.75rem' }}>{m.paid}/9{m.miss > 0 && <span style={{ color: 'var(--destructive)', marginLeft: 4 }}>·{m.miss} miss</span>}</span>
            <span style={{ ...mono, fontSize: '0.75rem', fontWeight: m.st === 'out' ? 600 : 400, color: m.st === 'out' ? 'var(--destructive)' : 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>{m.due}</span>
            <Pill tone={m.st === 'ok' ? 'paid' : m.st === 'pending' ? 'pending' : 'out'}>{m.st === 'ok' ? 'current' : m.st}</Pill>
            <button style={{ width: 26, height: 26, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <Lu name="MoreHorizontal" size={14} style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AD_Group_Cycles() {
  const cyc = Array.from({length: 12}).map((_, i) => ({
    n: i+1,
    recip: ['Adaeze O.', 'Kola A.', 'Moyo I.', 'Chioma E.', 'Nneka P.', 'Funke R.', 'Bolu S.', 'Emeka U.', 'Wale Y.', 'Yemi K.', 'You', 'Tola B.'][i],
    amt: '₦ 96,000',
    st: i < 9 ? 'closed' : i === 9 ? 'open' : 'future',
    date: i < 9 ? `Feb ${i+1}` : i === 9 ? 'Apr 22–28' : `— `,
  }));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Cycles · 12</h3>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Weekly rotation · 9 closed, 1 open, 2 upcoming</div>
        </div>
        <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Edit rotation</button>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr 0.9fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>Cycle</span><span>Recipient</span><span>Amount</span><span>Collected</span><span>Window</span><span>Status</span><span></span>
        </div>
        {cyc.map((c, i) => (
          <div key={i} className="status-row" data-tone={c.st === 'closed' ? 'paid' : c.st === 'open' ? 'pending' : null} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr 0.9fr auto', gap: 14, padding: '10px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < cyc.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>#{c.n}</span>
            <span style={{ fontWeight: c.st === 'open' ? 600 : 500 }}>{c.recip}</span>
            <span style={{ ...mono, fontSize: '0.75rem' }}>{c.amt}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: c.st === 'future' ? 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' : 'var(--d2-ink)' }}>
              {c.st === 'closed' ? '₦ 60,000' : c.st === 'open' ? '₦ 36,000' : '—'}
            </span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{c.date}</span>
            <Pill tone={c.st === 'closed' ? 'paid' : c.st === 'open' ? 'pending' : 'muted'}>{c.st}</Pill>
            <Lu name="ChevronRight" size={14} style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function AD_Group_Payments() {
  const pays = [
    { who: 'Adaeze O.', amt: '₦ 12,000', cyc: 'cycle 10', when: '1h ago',   st: 'confirmed', by: 'you' },
    { who: 'Moyo I.',   amt: '₦ 12,000', cyc: 'cycle 10', when: '2h ago',   st: 'pending',   by: '—' },
    { who: 'Kola A.',   amt: '₦ 12,000', cyc: 'cycle 10', when: '1d ago',   st: 'confirmed', by: 'you' },
    { who: 'You',       amt: '₦ 12,000', cyc: 'cycle 10', when: '2d ago',   st: 'confirmed', by: 'system' },
    { who: 'Kola A.',   amt: '₦ 96,000', cyc: 'cycle 9 payout', when: '1w ago', st: 'payout',    by: 'system', outgoing: true },
    { who: 'Tola B.',   amt: '₦ 12,000', cyc: 'cycle 9', when: '1w ago',   st: 'overdue',   by: '—' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Payments · 47</h3>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Ledger of contributions + payouts</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Filter ▾</button>
          <button style={{ padding: '7px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.8125rem', fontWeight: 500 }}>Export CSV</button>
        </div>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1.4fr 1fr 1.1fr 0.9fr 0.8fr', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span></span><span>Who · cycle</span><span>Amount</span><span>When</span><span>Confirmed by</span><span>Status</span>
        </div>
        {pays.map((p, i, arr) => (
          <div key={i} className="status-row" data-tone={p.st === 'confirmed' || p.st === 'payout' ? 'paid' : p.st === 'pending' ? 'pending' : 'out'} style={{ display: 'grid', gridTemplateColumns: 'auto 1.4fr 1fr 1.1fr 0.9fr 0.8fr', gap: 14, padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: p.outgoing ? 'var(--d2-accent-soft)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', color: p.outgoing ? 'var(--d2-accent)' : 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lu name={p.outgoing ? 'ArrowUpRight' : 'ArrowDownLeft'} size={13}/>
            </span>
            <div>
              <div style={{ fontWeight: 500 }}>{p.who}</div>
              <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{p.cyc}</div>
            </div>
            <span style={{ ...mono, fontSize: '0.8125rem', fontWeight: 500, color: p.outgoing ? 'var(--d2-accent)' : 'var(--d2-ink)' }}>{p.outgoing ? '−' : '+'} {p.amt}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{p.when}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{p.by}</span>
            <Pill tone={p.st === 'confirmed' || p.st === 'payout' ? 'paid' : p.st === 'pending' ? 'pending' : 'out'}>{p.st}</Pill>
          </div>
        ))}
      </div>
    </div>
  );
}

function AD_Group_Receipts() {
  const rows = [
    { from: 'Moyo I.',     amt: '₦ 12,000', cycle: 'cycle 10', wa: '2h ago', note: 'photo of transfer + "sent"' },
    { from: 'Chinedu V.',  amt: '₦ 12,000', cycle: 'cycle 10', wa: '5h ago', note: 'bank alert screenshot' },
    { from: 'Zainab R.',   amt: '₦ 12,000', cycle: 'cycle 10', wa: '1d ago', note: '"Done"' },
  ];
  return (
    <div>
      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--ajo-outstanding-subtle)', border: '1px solid color-mix(in oklch, var(--ajo-outstanding) 30%, transparent)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Lu name="Inbox" size={16} style={{ color: 'oklch(0.5 0.14 70)' }}/>
        <div style={{ flex: 1, fontSize: '0.8125rem', color: 'oklch(0.5 0.14 70)' }}>
          <span style={{ fontWeight: 600 }}>3 receipts need your review in this group.</span> The sidebar count (12) includes receipts from ChamaSave · main and Ibadan trip too.
        </div>
        <button style={{ padding: '6px 10px', borderRadius: 8, background: 'white', color: 'oklch(0.5 0.14 70)', fontSize: '0.75rem', fontWeight: 500 }}>Open full queue →</button>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.4fr auto', gap: 14, padding: '10px 16px', background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)', borderBottom: hair, ...mono, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>From · cycle</span><span>Amount</span><span>Submitted</span><span>Note</span><span>Action</span>
        </div>
        {rows.map((r, i, arr) => (
          <div key={i} className="status-row" data-tone="pending" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.4fr auto', gap: 14, padding: '12px 16px', alignItems: 'center', fontSize: '0.8125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{r.from}</div>
              <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.cycle}</div>
            </div>
            <span style={{ ...mono, fontWeight: 500 }}>{r.amt}</span>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.wa}</span>
            <span style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)' }}>{r.note}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--ajo-paid)', color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>Confirm</button>
              <button style={{ padding: '6px 10px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fontSize: '0.75rem', fontWeight: 500 }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AD_Group_Settings() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 960 }}>
      <div style={{ ...card, padding: '18px 20px' }}>
        <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 12 }}>Group</div>
        {[
          { k: 'Name',           v: 'Lagos Rent Q2' },
          { k: 'Currency',       v: 'NGN · Nigerian naira' },
          { k: 'Contribution',   v: '₦ 12,000 · weekly' },
          { k: 'Cadence',        v: 'Every Friday' },
          { k: 'Visibility',     v: 'Private · invite only' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', padding: '10px 0', fontSize: '0.8125rem', borderTop: i > 0 ? hair : 'none', alignItems: 'center' }}>
            <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.k}</span>
            <span>{r.v}</span>
            <button style={{ fontSize: '0.75rem', color: 'var(--d2-accent)', fontWeight: 500 }}>Edit</button>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: '18px 20px' }}>
        <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 12 }}>Receipts & WhatsApp</div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--d2-warm-bg)', border: hair, marginBottom: 10 }}>
          <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', ...mono }}>LINKED WHATSAPP GROUP</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--ajo-paid)' }}/>
            Lagos Rent Q2 · group chat
          </div>
          <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginTop: 2 }}>wa_group_id: 120363…4492 · bot active</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '8px 0', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Auto-nudge at cycle open</div>
            <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Bot posts "Cycle N open · pay by [date]"</div>
          </div>
          <div style={{ width: 40, height: 24, borderRadius: 999, background: 'var(--d2-accent)', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, borderRadius: 999, background: 'white' }}/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '8px 0', alignItems: 'center', borderTop: hair }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Allow receipts from un-linked members</div>
            <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>If off, bot only matches by phone</div>
          </div>
          <div style={{ width: 40, height: 24, borderRadius: 999, background: 'color-mix(in oklch, var(--d2-ink) 12%, transparent)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 2, top: 2, width: 20, height: 20, borderRadius: 999, background: 'white' }}/>
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: hair }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', color: 'var(--destructive)', marginBottom: 8 }}>Danger</div>
          <button style={{ fontSize: '0.8125rem', color: 'var(--destructive)', padding: '6px 0' }}>Close group (archive cycles)</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AD_Receipts, AD_Empty, AD_Group, Pill });
