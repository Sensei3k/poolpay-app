// Member desktop — Home, Pool detail, Pay flow, Inbox, Profile

function MD_Home() {
  return (
    <PPShell role="member" current="home" title="Home" sub="Thursday, 22 April 2026" showPay>
      <div className="hero-head">
        <div>
          <p className="hero-k">This month</p>
          <h1 className="hero-t">You're on track to collect<br/><span className="strong">₦ 428,500</span> across 4 pools.</h1>
        </div>
      </div>
      <div className="cards3">
        <div className="card accent"><span className="card-k"><Lu name="TrendingUp" size={12}/> Collected</span><span className="card-v">₦ 248,600</span><span className="card-d">62% of April target</span></div>
        <div className="card coral"><span className="card-k"><Lu name="Clock" size={12}/> Outstanding</span><span className="card-v">₦ 62,000</span><span className="card-d">3 contributions pending</span></div>
        <div className="card lav"><span className="card-k"><Lu name="HandCoins" size={12}/> Next payout</span><span className="card-v">₦ 18,500</span><span className="card-d">Fri 25 Apr · Ibadan trip</span></div>
      </div>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.75rem' }}>Your pools</h3>
      <div className="pools-grid">
        {[
          { sq: 'a', name: 'Lagos Rent Q2',      sub: 'weekly · 10/12', pct: 83, val: '₦ 84,000', foot: 'on track' },
          { sq: 'b', name: 'Family group · Feb', sub: 'monthly · 6/8',  pct: 75, val: '₦ 32,500', foot: '8 members' },
          { sq: 'c', name: 'Ibadan trip 2026',   sub: 'monthly · 2/6',  pct: 33, val: '₦ 18,000', foot: 'due Fri' },
          { sq: 'd', name: 'ChamaSave · main',   sub: 'weekly',         pct: 60, val: '₦ 96,100', foot: '12 members' },
        ].map((p, i) => (
          <div className="pool" key={i}>
            <div className="pool-top">
              <span className={`pool-sq ${p.sq}`}>{p.name[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div className="pool-ttl">{p.name}</div><div className="pool-sub">{p.sub}</div></div>
              <Lu name="ChevronRight" size={16} style={{ color: 'color-mix(in oklch, currentColor 55%, transparent)' }}/>
            </div>
            <div className="pool-bar"><span style={{ width: `${p.pct}%` }}/></div>
            <div className="pool-foot"><span style={{ color: 'color-mix(in oklch, currentColor 55%, transparent)' }}>{p.foot}</span><span className="val">{p.val}</span></div>
          </div>
        ))}
      </div>
    </PPShell>
  );
}

function MD_Pool() {
  const members = [
    { n: 'Adaeze O.', st: 'paid',       payout: false },
    { n: 'Kola A.',   st: 'paid',       payout: false },
    { n: 'Moyo I.',   st: 'pending',    payout: true  },
    { n: 'Tola B.',   st: 'outstanding',payout: false },
    { n: 'You',       st: 'paid',       payout: false },
  ];
  return (
    <PPShell role="member" current="pools" crumbs="Pools / Lagos Rent Q2" title="Lagos Rent Q2" sub="Weekly · NGN · cycle 10 of 12 · you contribute ₦ 12,000/wk" showPay>
      <div style={{ ...card, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <div className="kicker-mono" style={{ fontSize: '0.625rem' }}>Your payout</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, ...mono }}>₦ 96,000</div>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>arrives week 13 · in 3 weeks</div>
        </div>
        <div>
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 24, borderRadius: 4,
                background: i < 9 ? 'var(--d2-accent)' : i === 9 ? 'var(--ajo-outstanding)' : 'color-mix(in oklch, var(--d2-ink) 8%, transparent)',
                border: i === 9 ? '2px solid var(--d2-ink)' : 'none',
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
            <span>9 closed · cycle 10 open</span><span>your turn · week 13</span>
          </div>
        </div>
        <button style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--d2-accent)', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Pay this week</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Members · this cycle</h3>
            <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>3 paid · 1 pending · 1 outstanding</span>
          </div>
          {members.map((m, i, arr) => (
            <div key={i} className="status-row" data-tone={m.st === 'paid' ? 'paid' : m.st === 'pending' ? 'pending' : 'out'} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '0.75rem', alignItems: 'center',
              padding: '0.625rem 12px', fontSize: '0.8125rem',
              borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
            }}>
              <span className="avatar sm" style={{ background: 'oklch(0.72 0.13 38)', color: 'white', border: 'none' }}>{m.n[0]}</span>
              <span style={{ fontWeight: 500 }}>{m.n}{m.payout && <span style={{ marginLeft: 8, ...mono, fontSize: '0.625rem', padding: '2px 6px', borderRadius: 4, background: 'var(--d2-accent-soft)', color: 'var(--d2-accent)' }}>payout this cycle</span>}</span>
              <span style={{ ...mono, fontSize: '0.625rem', padding: '2px 8px', borderRadius: 999,
                background: m.st === 'paid' ? 'var(--ajo-paid-subtle)' : m.st === 'pending' ? 'var(--ajo-outstanding-subtle)' : 'color-mix(in oklch, var(--destructive) 14%, transparent)',
                color:      m.st === 'paid' ? 'var(--ajo-paid)'        : m.st === 'pending' ? 'var(--ajo-outstanding)'        : 'var(--destructive)',
              }}>{m.st}</span>
              <span style={{ ...mono, fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>₦ 12,000</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '1rem 1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 10px' }}>Recent activity</h3>
          {[
            { ico: 'ArrowUp',  t: 'You paid ₦ 12,000',      w: '2 days ago' },
            { ico: 'Check',    t: 'Cycle 9 closed',          w: '3 days ago' },
            { ico: 'HandCoins',t: 'Payout ₦ 96,000 → Kola',  w: '1 week ago' },
            { ico: 'UserPlus', t: 'Tola joined',             w: '2 weeks ago' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0.375rem 0', fontSize: '0.8125rem' }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lu name={a.ico} size={12}/>
              </span>
              <span style={{ flex: 1 }}>{a.t}</span>
              <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{a.w}</span>
            </div>
          ))}
        </div>
      </div>
    </PPShell>
  );
}

function MD_Pay() {
  return (
    <PPShell role="member" current="pools" crumbs="Pools / Lagos Rent Q2 / Pay" title="Pay contribution" sub="Cycle 10 · due Fri 25 Apr">
      <div style={{ maxWidth: 560 }}>
        <div style={{ ...card, padding: '1.25rem 1.5rem', marginBottom: 12 }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem' }}>Amount due</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', ...mono }}>₦ 12,000</div>
          <div style={{ fontSize: '0.8125rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>to Lagos Rent Q2 · cycle 10 payout → Adaeze O.</div>
        </div>

        <div style={{ ...card, padding: '1rem 1.25rem', marginBottom: 12 }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 8 }}>1 · Send to group account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, ...mono, fontSize: '0.875rem' }}>
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--d2-warm-bg)', border: hair }}>
              <div style={{ fontSize: '0.625rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', marginBottom: 2 }}>Bank · Access Bank</div>
              <div>0123 456 789 — PoolPay / Lagos Rent Q2</div>
            </div>
            <button style={{ padding: '0 14px', borderRadius: 10, background: 'var(--d2-warm-bg)', border: hair, fontSize: '0.75rem', fontWeight: 500 }}>Copy</button>
          </div>
        </div>

        <div style={{ ...card, padding: '1rem 1.25rem', marginBottom: 12 }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 8 }}>2 · Share receipt on WhatsApp</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'var(--d2-warm-bg)', border: hair }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: '#25D366', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Lu name="MessageSquare" size={18}/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Lagos Rent Q2 · group chat</div>
              <div style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>bot matches by your phone number</div>
            </div>
            <button style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500 }}>Open WhatsApp</button>
          </div>
        </div>

        <div style={{ ...card, padding: '1rem 1.25rem' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 8 }}>3 · Wait for admin confirmation</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ajo-outstanding-subtle)', color: 'var(--ajo-outstanding)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lu name="Clock" size={14}/>
            </span>
            <div style={{ flex: 1, fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 500 }}>Pending review</div>
              <div style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>An admin will confirm your payment within a few hours. You'll get a notification in Inbox and a reply in the WhatsApp thread.</div>
            </div>
          </div>
        </div>

        <p style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 45%, transparent)', marginTop: 14 }}>
          poolpay never touches your money · transfers go directly between members via bank · receipts are verified by admin, not by OCR
        </p>
      </div>
    </PPShell>
  );
}

function MD_Inbox() {
  const items = [
    { ico: 'CheckCircle2', t: 'Your payment was confirmed', s: 'Lagos Rent Q2 · ₦ 12,000 · cycle 9', w: '2 days ago', tone: 'paid', unread: true },
    { ico: 'HandCoins',    t: 'Payout arriving Friday',      s: 'Ibadan trip 2026 · ₦ 18,500',        w: '4 days ago', tone: 'accent' },
    { ico: 'UserPlus',     t: 'Tola B. joined Ibadan trip', s: 'Ibadan trip 2026',                    w: '1 week ago', tone: 'muted' },
    { ico: 'MessageSquare',t: 'Adaeze O. replied on WhatsApp', s: 'Lagos Rent Q2',                   w: '1 week ago', tone: 'muted' },
    { ico: 'AlertCircle',  t: 'Contribution overdue',         s: 'Family group · Feb · ₦ 5,000',       w: '2 weeks ago', tone: 'out' },
  ];
  return (
    <PPShell role="member" current="inbox" title="Inbox" sub="5 unread · all pools">
      <div style={{ maxWidth: 720 }}>
        {items.map((it, i, arr) => (
          <div key={i} className={it.unread ? "status-row" : undefined} data-tone={it.unread ? it.tone : null} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
            padding: '1rem 1.125rem', borderBottom: i < arr.length-1 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none',
          }}>
            <span style={{ width: 36, height: 36, borderRadius: 10,
              background: it.tone === 'paid' ? 'var(--ajo-paid-subtle)' : it.tone === 'out' ? 'color-mix(in oklch, var(--destructive) 12%, transparent)' : it.tone === 'accent' ? 'var(--d2-accent-soft)' : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              color:      it.tone === 'paid' ? 'var(--ajo-paid)'        : it.tone === 'out' ? 'var(--destructive)'                                        : it.tone === 'accent' ? 'var(--d2-accent)'   : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lu name={it.ico} size={16}/>
            </span>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: it.unread ? 600 : 500 }}>{it.t}</div>
              <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{it.s}</div>
            </div>
            <span style={{ ...mono, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{it.w}</span>
          </div>
        ))}
      </div>
    </PPShell>
  );
}

function MD_Profile() {
  return (
    <PPShell role="member" current="settings" crumbs="Settings" title="Profile & security" sub="Your account · ngozi@chamasave.ng">
      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...card, padding: '1.125rem 1.25rem' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 10 }}>Profile</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <span className="avatar lg" style={{ background: 'linear-gradient(135deg, var(--d2-coral), var(--d2-lav))', color: 'white', border: 'none', width: 52, height: 52, fontSize: '1.125rem' }}>N</span>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Ngozi Okoye</div>
              <div style={{ fontSize: '0.8125rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>+234 803 456 7890 · ngozi@chamasave.ng</div>
            </div>
          </div>
          {[
            { k: 'Display name',  v: 'Ngozi Okoye' },
            { k: 'Phone',         v: '+234 803 456 7890', n: 'identity — used by WhatsApp bot to match your payments' },
            { k: 'Email',         v: 'ngozi@chamasave.ng' },
            { k: 'Language',      v: 'English' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', padding: '0.625rem 0', fontSize: '0.8125rem', borderTop: i > 0 ? hair : 'none', alignItems: 'center' }}>
              <span style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', ...mono, fontSize: '0.75rem' }}>{f.k}</span>
              <div>
                <div>{f.v}</div>
                {f.n && <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>{f.n}</div>}
              </div>
              <button style={{ fontSize: '0.75rem', color: 'var(--d2-accent)', fontWeight: 500 }}>Edit</button>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '1.125rem 1.25rem' }}>
          <div className="kicker-mono" style={{ fontSize: '0.625rem', marginBottom: 10 }}>Security</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', padding: '0.625rem 0' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Change password</div>
              <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Last changed 3 months ago</div>
            </div>
            <button style={{ padding: '7px 12px', borderRadius: 10, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: '0.8125rem', fontWeight: 500 }}>Change</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', padding: '0.625rem 0', borderTop: hair }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active sessions</div>
              <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>2 devices · iPhone 15 (Lagos), Chrome (Mac)</div>
            </div>
            <button style={{ padding: '7px 12px', borderRadius: 10, background: 'transparent', border: hair, fontSize: '0.8125rem' }}>Manage</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', padding: '0.625rem 0', borderTop: hair }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--destructive)' }}>Sign out everywhere</div>
              <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Ends sessions on all devices · your live JWT dies within 15 min</div>
            </div>
            <button style={{ padding: '7px 12px', borderRadius: 10, background: 'transparent', border: '1px solid color-mix(in oklch, var(--destructive) 40%, transparent)', color: 'var(--destructive)', fontSize: '0.8125rem' }}>Sign out all</button>
          </div>
        </div>
      </div>
    </PPShell>
  );
}

Object.assign(window, { MD_Home, MD_Pool, MD_Pay, MD_Inbox, MD_Profile });
