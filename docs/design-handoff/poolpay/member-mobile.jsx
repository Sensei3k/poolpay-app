// Member mobile — mobile WEB view (responsive breakpoint of the same app).
// Not iOS native. Device dimensions match a typical phone viewport (390×844).
// Chrome is plain web: thin app bar, bottom tab bar styled like the rest of
// the web app (no liquid-glass blur, same fonts/colors as desktop).

function MWFrame({ children }) {
  // Simple browser viewport frame — thin gray border, no status bar, no home indicator.
  return (
    <div style={{
      width: 390, height: 844, background: 'var(--d2-warm-bg)', color: 'var(--d2-ink)',
      border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)',
      borderRadius: 14, overflow: 'hidden', position: 'relative',
      fontFamily: 'Geist, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

function MWAppBar({ title, sub, showBack = false, crumb, right = null }) {
  return (
    <div style={{
      flexShrink: 0, padding: '12px 16px 10px',
      borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      background: 'var(--d2-warm-bg)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {showBack && <button style={{ width: 28, height: 28, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Lu name="ChevronLeft" size={18}/></button>}
      {!showBack && <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, var(--d2-accent), var(--d2-lav))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>P</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {crumb && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{crumb}</div>}
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{sub}</div>}
      </div>
      {right || (
        <button style={{ width: 32, height: 32, borderRadius: 999, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lu name="Bell" size={15}/>
        </button>
      )}
    </div>
  );
}

function MWTabBar({ current = 'home', role = 'member' }) {
  const tabs = role === 'admin' ? [
    { id: 'receipts', ico: 'ReceiptText', l: 'Queue', badge: 12 },
    { id: 'groups',   ico: 'UsersRound',   l: 'Groups' },
    { id: 'inbox',    ico: 'Bell',          l: 'Inbox' },
    { id: 'me',       ico: 'CircleUserRound', l: 'Me' },
  ] : [
    { id: 'home',   ico: 'House',       l: 'Home' },
    { id: 'pools',  ico: 'UsersRound',  l: 'Pools' },
    { id: 'inbox',  ico: 'Bell',         l: 'Inbox',  badge: 5 },
    { id: 'me',     ico: 'CircleUserRound', l: 'Me' },
  ];
  return (
    <div style={{
      flexShrink: 0, display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
      borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      background: 'var(--d2-warm-bg)',
      padding: '6px 0 8px',
    }}>
      {tabs.map(t => {
        const on = current === t.id;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 0', position: 'relative', color: on ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
            <Lu name={t.ico} size={19} style={{ strokeWidth: on ? 2.1 : 1.75 }}/>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{t.l}</span>
            {t.badge && <span style={{ position: 'absolute', top: 1, right: 'calc(50% - 18px)', minWidth: 14, height: 14, padding: '0 4px', borderRadius: 999, background: 'var(--destructive)', color: 'white', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>{t.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}

function MWShell({ title, sub, crumb, showBack, tab, role, children, appBarRight }) {
  return (
    <div className="d2" style={{ width: '100%', height: '100%' }}>
      <MWFrame>
        <MWAppBar title={title} sub={sub} crumb={crumb} showBack={showBack} right={appBarRight}/>
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 0' }}>{children}</div>
        <MWTabBar current={tab} role={role}/>
      </MWFrame>
    </div>
  );
}

function MWCard({ children, style = {} }) {
  return <div style={{
    margin: '0 14px 10px',
    borderRadius: 12,
    padding: '12px 14px',
    background: 'var(--d2-cream)',
    border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
    ...style,
  }}>{children}</div>;
}

function MWSectionHead({ children, action }) {
  return <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 18px 6px',
    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
  }}>
    <span>{children}</span>
    {action && <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: 'var(--d2-accent)' }}>{action}</span>}
  </div>;
}

// ─── Member screens ─────────────────────────────────────────────

function MM_Home() {
  return (
    <MWShell title="PoolPay" sub="Thursday, 22 Apr" tab="home" role="member">
      <MWCard style={{ padding: '16px 18px', background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', border: 'none' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>This month · on track</div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>₦ 428,500</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>across 4 pools · 62% collected</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'var(--d2-accent)', color: 'white', fontWeight: 600, fontSize: 13 }}>Pay contribution</button>
          <button style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: 'var(--d2-warm-bg)', fontWeight: 500, fontSize: 13 }}>Request</button>
        </div>
      </MWCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 14px 14px' }}>
        <div style={{ borderRadius: 12, padding: '10px 12px', background: 'color-mix(in oklch, var(--d2-coral) 10%, var(--d2-cream))', border: '1px solid color-mix(in oklch, var(--d2-coral) 18%, transparent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(0.55 0.14 38)' }}>Outstanding</div>
          <div style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2, fontFamily: 'var(--font-mono)' }}>₦ 62,000</div>
          <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>3 pending</div>
        </div>
        <div style={{ borderRadius: 12, padding: '10px 12px', background: 'color-mix(in oklch, var(--d2-lav) 12%, var(--d2-cream))', border: '1px solid color-mix(in oklch, var(--d2-lav) 20%, transparent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(0.5 0.1 310)' }}>Next payout</div>
          <div style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2, fontFamily: 'var(--font-mono)' }}>₦ 18,500</div>
          <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Fri 25 Apr</div>
        </div>
      </div>

      <MWSectionHead action="See all">Your pools · 4</MWSectionHead>
      {[
        { sq: 'a', n: 'Lagos Rent Q2', sub: 'weekly · cycle 10/12', pct: 83, due: 'Pay ₦ 12,000 by Fri', hot: true },
        { sq: 'b', n: 'Family group · Feb', sub: 'monthly · cycle 6/8', pct: 75 },
        { sq: 'c', n: 'Ibadan trip 2026', sub: 'monthly · cycle 2/6', pct: 33, due: 'Payout arriving' },
        { sq: 'd', n: 'ChamaSave · main', sub: 'weekly', pct: 60 },
      ].map((p, i) => (
        <MWCard key={i}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span className={`pool-sq ${p.sq}`} style={{ width: 32, height: 32, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{p.n[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{p.n}</div>
              <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{p.sub}</div>
            </div>
            <Lu name="ChevronRight" size={16} style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}/>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)', overflow: 'hidden' }}>
            <div style={{ width: `${p.pct}%`, height: '100%', background: 'var(--d2-accent)', borderRadius: 999 }}/>
          </div>
          {p.due && <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: p.hot ? 'var(--ajo-outstanding-subtle)' : 'var(--d2-accent-soft)', color: p.hot ? 'oklch(0.5 0.14 70)' : 'var(--d2-accent)', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lu name={p.hot ? 'Clock' : 'HandCoins'} size={12}/> {p.due}
          </div>}
        </MWCard>
      ))}
    </MWShell>
  );
}

function MM_Pool() {
  const members = [
    { n: 'Adaeze O.', st: 'paid',    payout: false },
    { n: 'Kola A.',   st: 'paid',    payout: false },
    { n: 'Moyo I.',   st: 'pending', payout: true  },
    { n: 'Tola B.',   st: 'out',     payout: false },
    { n: 'You',       st: 'paid',    payout: false },
  ];
  return (
    <MWShell title="Lagos Rent Q2" crumb="Pools" showBack tab="pools" role="member">
      <MWCard style={{ padding: '16px 18px', background: 'linear-gradient(135deg, var(--d2-accent), oklch(0.55 0.14 190))', color: 'white', border: 'none' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>Your payout · week 13</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>₦ 96,000</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>arrives in 3 weeks · 5 members · weekly</div>
        <div style={{ display: 'flex', gap: 2, marginTop: 12 }}>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 16, borderRadius: 3,
              background: i < 9 ? 'rgba(255,255,255,0.95)' : i === 9 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
              border: i === 9 ? '1.5px solid white' : 'none',
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4, opacity: 0.85 }}>
          <span>9 closed · cycle 10 open</span><span>w13 · your turn</span>
        </div>
      </MWCard>

      <MWCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>You owe this cycle</div>
            <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>₦ 12,000</div>
            <div style={{ fontSize: 11, color: 'oklch(0.5 0.14 70)' }}>due Fri 25 Apr</div>
          </div>
          <button style={{ padding: '9px 16px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontWeight: 600, fontSize: 13 }}>Pay now</button>
        </div>
      </MWCard>

      <div style={{ margin: '4px 14px 10px', padding: 3, borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', display: 'flex', fontSize: 12 }}>
        {['Members', 'Activity', 'Details'].map((s, i) => (
          <div key={s} style={{
            flex: 1, textAlign: 'center', padding: '5px 0', borderRadius: 6,
            background: i === 0 ? 'var(--d2-cream)' : 'transparent',
            fontWeight: i === 0 ? 600 : 500,
            color: i === 0 ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 60%, transparent)',
            boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
          }}>{s}</div>
        ))}
      </div>

      <MWCard style={{ padding: 0 }}>
        {members.map((m, i, arr) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '11px 14px', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--d2-coral)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{m.n[0]}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{m.n}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: m.payout ? 'var(--d2-accent)' : 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>
                {m.payout ? 'payout this cycle' : '₦ 12,000'}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', borderRadius: 999,
              background: m.st === 'paid' ? 'var(--ajo-paid-subtle)' : m.st === 'pending' ? 'var(--ajo-outstanding-subtle)' : 'color-mix(in oklch, var(--destructive) 12%, transparent)',
              color:      m.st === 'paid' ? 'var(--ajo-paid)'        : m.st === 'pending' ? 'oklch(0.5 0.14 70)'           : 'var(--destructive)',
            }}>{m.st === 'out' ? 'overdue' : m.st}</span>
          </div>
        ))}
      </MWCard>
    </MWShell>
  );
}

function MM_Pay() {
  return (
    <MWShell title="Pay contribution" crumb="Lagos Rent Q2 / Pay" showBack tab="pools" role="member">
      <MWCard style={{ padding: '16px 18px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Amount due</div>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>₦ 12,000</div>
        <div style={{ fontSize: 12, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>cycle 10 payout → Adaeze O.</div>
      </MWCard>

      <MWSectionHead>1 · Send via bank</MWSectionHead>
      <MWCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Access Bank</div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' }}>0123 456 789</div>
            <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>PoolPay / Lagos Rent Q2</div>
          </div>
          <button style={{ padding: '7px 12px', borderRadius: 8, background: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)', fontSize: 12, fontWeight: 500 }}>Copy</button>
        </div>
      </MWCard>

      <MWSectionHead>2 · Share receipt on WhatsApp</MWSectionHead>
      <MWCard>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: '#25D366', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Lu name="MessageSquare" size={18}/>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Lagos Rent Q2 group</div>
            <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Bot matches by your phone number</div>
          </div>
        </div>
        <button style={{ width: '100%', marginTop: 10, padding: '10px', borderRadius: 10, background: '#25D366', color: 'white', fontWeight: 600, fontSize: 13 }}>Open WhatsApp</button>
      </MWCard>

      <MWSectionHead>3 · Wait for admin confirmation</MWSectionHead>
      <MWCard>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--ajo-outstanding-subtle)', color: 'oklch(0.5 0.14 70)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Lu name="Clock" size={13}/>
          </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Pending review</div>
            <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>An admin confirms within a few hours. You'll get a notification.</div>
          </div>
        </div>
      </MWCard>

      <div style={{ padding: '2px 18px 12px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', textAlign: 'center' }}>
        poolpay never touches your money · transfers go bank-to-bank
      </div>
    </MWShell>
  );
}

function MM_Inbox() {
  const items = [
    { ico: 'CheckCircle2', t: 'Payment confirmed',       s: 'Lagos Rent Q2 · ₦ 12,000',    w: '2d', tone: 'paid',   unread: true },
    { ico: 'HandCoins',    t: 'Payout arriving Friday',  s: 'Ibadan trip 2026 · ₦ 18,500', w: '4d', tone: 'accent', unread: true },
    { ico: 'UserPlus',     t: 'Tola B. joined',          s: 'Ibadan trip 2026',            w: '1w', tone: 'muted' },
    { ico: 'MessageSquare',t: 'Adaeze O. replied',       s: 'Lagos Rent Q2 · WhatsApp',    w: '1w', tone: 'muted' },
    { ico: 'AlertCircle',  t: 'Contribution overdue',    s: 'Family group · ₦ 5,000',       w: '2w', tone: 'out' },
  ];
  return (
    <MWShell title="Inbox" sub="5 notifications · 2 unread" tab="inbox" role="member">
      <MWCard style={{ padding: 0 }}>
        {items.map((it, i, arr) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center',
            padding: '12px 14px',
            borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
            background: it.unread ? 'color-mix(in oklch, var(--d2-accent) 4%, transparent)' : 'transparent',
          }}>
            <span style={{ width: 34, height: 34, borderRadius: 10,
              background: it.tone === 'paid' ? 'var(--ajo-paid-subtle)' : it.tone === 'out' ? 'color-mix(in oklch, var(--destructive) 12%, transparent)' : it.tone === 'accent' ? 'var(--d2-accent-soft)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              color:      it.tone === 'paid' ? 'var(--ajo-paid)'        : it.tone === 'out' ? 'var(--destructive)'                                      : it.tone === 'accent' ? 'var(--d2-accent)'   : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Lu name={it.ico} size={15}/>
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: it.unread ? 600 : 500 }}>{it.t}</div>
              <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{it.s}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{it.w}</span>
          </div>
        ))}
      </MWCard>
    </MWShell>
  );
}

function MM_Profile() {
  return (
    <MWShell title="Profile" tab="me" role="member">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 20px 18px' }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'linear-gradient(135deg, var(--d2-coral), var(--d2-lav))', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>N</span>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 10 }}>Ngozi Okoye</div>
        <div style={{ fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>+234 803 456 7890</div>
        <span style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)' }}>member</span>
      </div>

      <MWSectionHead>Account</MWSectionHead>
      <MWCard style={{ padding: 0 }}>
        {[
          { ico: 'User',  l: 'Display name', v: 'Ngozi Okoye' },
          { ico: 'Phone', l: 'Phone',         v: '+234 803 ···', n: 'used by WhatsApp bot' },
          { ico: 'Mail',  l: 'Email',         v: 'ngozi@chamasave.ng' },
          { ico: 'Globe', l: 'Language',      v: 'English' },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 10, alignItems: 'center', padding: '11px 14px', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <Lu name={r.ico} size={16} style={{ color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.l}</div>
              {r.n && <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{r.n}</div>}
            </div>
            <span style={{ fontSize: 12, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.v}</span>
            <Lu name="ChevronRight" size={14} style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}/>
          </div>
        ))}
      </MWCard>

      <MWSectionHead>Security</MWSectionHead>
      <MWCard style={{ padding: 0 }}>
        {[
          { ico: 'Lock',       l: 'Change password', v: '3 months ago' },
          { ico: 'Smartphone', l: 'Active sessions',  v: '2 devices' },
          { ico: 'LogOut',     l: 'Sign out',         v: '', danger: true },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '11px 14px', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none' }}>
            <Lu name={r.ico} size={16} style={{ color: r.danger ? 'var(--destructive)' : 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: r.danger ? 'var(--destructive)' : 'var(--d2-ink)' }}>{r.l}</div>
              {r.v && <div style={{ fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.v}</div>}
            </div>
            {!r.danger && <Lu name="ChevronRight" size={14} style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}/>}
          </div>
        ))}
      </MWCard>
    </MWShell>
  );
}

Object.assign(window, { MM_Home, MM_Pool, MM_Pay, MM_Inbox, MM_Profile, MWShell, MWCard, MWSectionHead, MWFrame });
