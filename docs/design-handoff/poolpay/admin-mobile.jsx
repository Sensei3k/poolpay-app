// Admin mobile — Receipts queue + Group (read-only tabs)
// Reuses MWShell/MWCard from member-mobile.jsx. Admins on mobile TRIAGE;
// configuration stays desktop.

function AM_Receipts() {
  const rows = [
    { gp: 'Lagos Rent Q2',   gpSq: 'a', from: 'Moyo I.',    amt: '₦ 12,000', when: '2h', note: 'photo + "sent"' },
    { gp: 'Lagos Rent Q2',   gpSq: 'a', from: 'Adaeze O.',   amt: '₦ 12,000', when: '3h', note: '"Paid"' },
    { gp: 'ChamaSave',       gpSq: 'd', from: 'Chioma E.',   amt: '₦ 8,500',  when: '4h', note: 'screenshot' },
    { gp: 'Ibadan trip',     gpSq: 'c', from: 'Tola B.',     amt: '₦ 15,000', when: '5h', note: 'bank alert' },
    { gp: 'Family group',    gpSq: 'b', from: 'Yemi K.',     amt: '₦ 5,000',  when: '1d', note: 'no attachment' },
  ];
  return (
    <MWShell title="Receipts" sub="12 awaiting · 3 groups" tab="receipts" role="admin">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 14px 10px' }}>
        <div style={{ borderRadius: 10, padding: '10px 12px', background: 'var(--ajo-outstanding-subtle)', border: '1px solid color-mix(in oklch, var(--ajo-outstanding) 25%, transparent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(0.5 0.14 70)' }}>Awaiting</div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>12</div>
          <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>oldest · 2d</div>
        </div>
        <div style={{ borderRadius: 10, padding: '10px 12px', background: 'var(--ajo-paid-subtle)', border: '1px solid color-mix(in oklch, var(--ajo-paid) 25%, transparent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ajo-paid)' }}>This week</div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>38</div>
          <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>confirmed</div>
        </div>
      </div>

      <MWCard style={{ padding: 0 }}>
        {rows.map((r, i, arr) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '11px 14px', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span className={`pool-sq ${r.gpSq}`} style={{ width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{r.gp[0]}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                {r.from} <span style={{ ...mono, fontSize: 11, fontWeight: 400, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>· {r.amt}</span>
              </div>
              <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.gp} · {r.note}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ ...mono, fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{r.when}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                <button style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--ajo-paid)', color: 'white', fontSize: 11, fontWeight: 500 }}>✓</button>
                <button style={{ padding: '4px 8px', borderRadius: 6, background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)', fontSize: 11, fontWeight: 500 }}>View</button>
              </div>
            </div>
          </div>
        ))}
      </MWCard>
      <div style={{ padding: '0 18px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', textAlign: 'center' }}>
        triage on mobile · configure groups on desktop
      </div>
    </MWShell>
  );
}

function AM_Group() {
  const TABS = [
    { id: 'overview', l: 'Overview' }, { id: 'members', l: 'Members' },
    { id: 'cycles', l: 'Cycles' }, { id: 'payments', l: 'Payments' },
    { id: 'receipts', l: 'Receipts', hot: true }, { id: 'settings', l: 'Settings' },
  ];
  return (
    <MWShell title="Lagos Rent Q2" crumb="Administration" showBack tab="groups" role="admin">
      {/* scrollable tab strip */}
      <div style={{ overflowX: 'auto', padding: '0 14px 10px', borderBottom: hair, margin: '0 0 10px' }}>
        <div style={{ display: 'inline-flex', gap: 2, whiteSpace: 'nowrap' }}>
          {TABS.map((t, i) => {
            const on = i === 0;
            return (
              <span key={t.id} style={{
                padding: '6px 10px', fontSize: 12, fontWeight: on ? 600 : 500,
                color: on ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
                borderBottom: on ? '2px solid var(--d2-ink)' : '2px solid transparent',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {t.l}
                {t.hot && <span style={{ ...mono, fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--ajo-outstanding-subtle)', color: 'oklch(0.5 0.14 70)', fontWeight: 600 }}>3</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Overview content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '0 14px 10px' }}>
        {[
          { k: 'Balance',   v: '₦ 84,000' },
          { k: 'Collected', v: '₦ 36k/60k' },
          { k: 'Next payout', v: '₦ 96,000' },
          { k: 'Health',   v: '92%' },
        ].map((s, i) => (
          <div key={i} style={{ borderRadius: 10, padding: '9px 11px', background: 'var(--d2-cream)', border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{s.k}</div>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <MWCard>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 8 }}>Cycles · 12</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 16, borderRadius: 3,
              background: i < 9 ? 'var(--ajo-paid)' : i === 9 ? 'var(--ajo-outstanding)' : 'color-mix(in oklch, var(--d2-ink) 10%, transparent)',
              border: i === 9 ? '1.5px solid var(--d2-ink)' : 'none',
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 10, marginTop: 6, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>9 closed</span><span>cycle 10 open</span><span>2 upcoming</span>
        </div>
      </MWCard>

      <MWCard style={{ padding: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Members · 5</div>
          <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>3 paid · 1 pending · 1 overdue</div>
        </div>
        {[
          { n: 'Adaeze O.', st: 'paid' }, { n: 'Kola A.', st: 'paid' },
          { n: 'Moyo I.', st: 'pending' }, { n: 'Tola B.', st: 'out' },
        ].map((m, i, arr) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '10px 14px', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--d2-coral)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>{m.n[0]}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.n}</span>
            <Pill tone={m.st === 'paid' ? 'paid' : m.st === 'pending' ? 'pending' : 'out'}>{m.st === 'out' ? 'overdue' : m.st}</Pill>
          </div>
        ))}
      </MWCard>

      <div style={{ padding: '0 18px 4px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', textAlign: 'center' }}>
        read-only on mobile · open desktop to edit rotation & settings
      </div>
    </MWShell>
  );
}

Object.assign(window, { AM_Receipts, AM_Group });
