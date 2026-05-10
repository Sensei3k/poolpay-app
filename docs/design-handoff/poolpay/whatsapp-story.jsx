// WhatsApp ingestion storyboard — 3 panels, 1440×520
// Shows the full loop: member sends receipt in WhatsApp → PoolPay bot
// acknowledges + matches by phone → admin confirms in PoolPay queue.
// Deliberately NOT an OCR pitch: humans verify money.

function WAPanel({ n, title, sub, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: 'var(--d2-warm-bg)', borderRadius: 18, border: '1px solid color-mix(in oklch, var(--d2-ink) 10%, transparent)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ ...mono, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}>Step {n}</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', marginTop: 4, maxWidth: 360 }}>{sub}</div>
        </div>
        <span style={{ width: 28, height: 28, borderRadius: 999, border: '1px solid color-mix(in oklch, var(--d2-ink) 15%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: '0.75rem', fontWeight: 600, color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' }}>{n}</span>
      </div>
      {children}
    </div>
  );
}

// WhatsApp chat bubble component
function WABubble({ side = 'left', name, time, children, bg }) {
  const isR = side === 'right';
  return (
    <div style={{ display: 'flex', justifyContent: isR ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '82%',
        background: bg || (isR ? '#D9FDD2' : '#fff'),
        borderRadius: 8,
        padding: '6px 9px 5px',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.08)',
        fontSize: '0.75rem',
        lineHeight: 1.35,
        position: 'relative',
      }}>
        {name && <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#06855C', marginBottom: 1 }}>{name}</div>}
        <div style={{ color: '#111' }}>{children}</div>
        <div style={{ ...mono, fontSize: '0.5625rem', color: '#667781', textAlign: 'right', marginTop: 1 }}>{time}</div>
      </div>
    </div>
  );
}

// Minimal WhatsApp chat frame (green header, tiled bg)
function WAPhone({ header = 'Lagos Rent Q2', members = '5 members', children }) {
  return (
    <div style={{
      width: '100%', maxWidth: 320, height: 400,
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)',
      background: '#EFE7DE',
      display: 'flex', flexDirection: 'column',
      margin: '0 auto',
      boxShadow: '0 8px 20px -8px rgba(0,0,0,0.15)',
    }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', background: '#008069', color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Lu name="ChevronLeft" size={16}/>
        <span style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>L</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{header}</div>
          <div style={{ fontSize: '0.6875rem', opacity: 0.85 }}>{members}</div>
        </div>
        <Lu name="Video" size={15}/>
        <Lu name="Phone" size={14}/>
      </div>
      {/* Chat area */}
      <div style={{
        flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8,
        background: '#EFE7DE',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0,0,0,0.02) 0 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.02) 0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
      {/* Composer */}
      <div style={{ padding: '7px 10px', background: '#F0F2F5', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 26, borderRadius: 999, background: 'white', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.6875rem', color: '#667781' }}>Message</div>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: '#008069', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Lu name="Mic" size={13}/>
        </div>
      </div>
    </div>
  );
}

// Arrow between panels
function WAArrow() {
  return (
    <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ height: 1, background: 'repeating-linear-gradient(90deg, color-mix(in oklch, var(--d2-ink) 30%, transparent) 0 4px, transparent 4px 8px)' }}/>
        <Lu name="ArrowRight" size={18} style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}/>
      </div>
    </div>
  );
}

function WAStoryboard() {
  return (
    <div style={{ width: '100%', height: '100%', padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ ...mono, fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>WhatsApp ingestion · end-to-end</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 2 }}>Receipt in WhatsApp → bot matches by phone → admin confirms in PoolPay.</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 10 }}>
        {/* Panel 1 — Member posts in WhatsApp */}
        <WAPanel n={1} title="Moyo sends proof in the group chat" sub="No PoolPay app open. She does what she already does — post the screenshot + 'sent'.">
          <WAPhone>
            <WABubble side="left" name="Adaeze" time="10:14" bg="#fff">
              Cycle 10 due today, pls confirm 🙏
            </WABubble>
            <WABubble side="right" time="10:42">
              <div style={{ width: 160, height: 100, borderRadius: 5, background: 'linear-gradient(135deg, #2A6E4A 0%, #1B4D33 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 10, color: 'white', marginBottom: 4, gap: 3 }}>
                <div style={{ fontSize: 9, opacity: 0.75, ...mono }}>FIRST BANK · TRANSFER</div>
                <div style={{ fontSize: 16, fontWeight: 700, ...mono }}>₦ 12,000.00</div>
                <div style={{ fontSize: 9, opacity: 0.9 }}>→ Adaeze Okonkwo</div>
                <div style={{ fontSize: 8, ...mono, opacity: 0.65 }}>ref · TRF/2026/04/22/8871</div>
              </div>
              Sent ✅
            </WABubble>
          </WAPhone>
        </WAPanel>

        <WAArrow/>

        {/* Panel 2 — Bot acknowledges */}
        <WAPanel n={2} title="Bot acks + matches by phone" sub="PoolPay bot recognizes Moyo's number. Posts a visible ack so members see it landed — no silent magic.">
          <WAPhone>
            <WABubble side="right" time="10:42">
              <div style={{ width: 140, height: 80, borderRadius: 5, background: 'linear-gradient(135deg, #2A6E4A 0%, #1B4D33 100%)', marginBottom: 4 }}/>
              Sent ✅
            </WABubble>
            <WABubble side="left" name="PoolPay bot" time="10:43" bg="#F0FAE6">
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 8, fontWeight: 700 }}>P</span>
                <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>Got it, Moyo.</span>
              </div>
              Matched <b>+234 803 ··· ·003</b> → Moyo I. in <b>Lagos Rent Q2 · cycle 10</b>.
              <div style={{ marginTop: 4, padding: '4px 7px', background: 'rgba(0,0,0,0.04)', borderRadius: 4, ...mono, fontSize: '0.6875rem' }}>
                status · awaiting admin confirmation
              </div>
            </WABubble>
            <WABubble side="left" name="Adaeze" time="10:44" bg="#fff">
              Thanks 🙏
            </WABubble>
          </WAPhone>
        </WAPanel>

        <WAArrow/>

        {/* Panel 3 — Admin confirms in PoolPay */}
        <WAPanel n={3} title="Admin confirms in PoolPay" sub="Ngozi scans the WhatsApp message + amount + member, taps Confirm. Money is recorded against cycle 10.">
          <div style={{ width: '100%', maxWidth: 380, margin: '0 auto', borderRadius: 12, background: 'var(--d2-cream)', border: hair, overflow: 'hidden' }}>
            {/* mini topbar */}
            <div style={{ padding: '10px 14px', borderBottom: hair, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--d2-warm-bg)' }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 10, fontWeight: 700 }}>P</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Receipts queue</span>
              <span style={{ ...mono, fontSize: '0.625rem', padding: '1px 6px', borderRadius: 4, background: 'var(--ajo-outstanding-subtle)', color: 'oklch(0.5 0.14 70)', fontWeight: 600, marginLeft: 'auto' }}>12</span>
            </div>
            {/* queue row — live one */}
            <div style={{ padding: '12px 14px', borderBottom: hair, background: 'color-mix(in oklch, var(--ajo-outstanding) 5%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="pool-sq a" style={{ width: 20, height: 20, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 10 }}>L</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Lagos Rent Q2 · cycle 10</span>
                <span style={{ ...mono, fontSize: '0.625rem', marginLeft: 'auto', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>just now</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Moyo I. · ₦ 12,000</div>
                  <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>photo + "sent" · via WhatsApp · matched by phone</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--ajo-paid)', color: 'white', fontSize: '0.6875rem', fontWeight: 500 }}>Confirm ✓</button>
                  <button style={{ padding: '6px 8px', borderRadius: 6, background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)', fontSize: '0.6875rem', fontWeight: 500 }}>View</button>
                </div>
              </div>
            </div>
            {/* other rows — faded */}
            {[
              { n: 'Adaeze O.', amt: '₦ 12,000', gp: 'Lagos Rent Q2', w: '3h' },
              { n: 'Chioma E.', amt: '₦ 8,500',  gp: 'ChamaSave',     w: '4h' },
              { n: 'Tola B.',   amt: '₦ 15,000', gp: 'Ibadan trip',   w: '5h' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '9px 14px', borderBottom: i < 2 ? '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)' : 'none', opacity: 0.6 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>{r.n} · <span style={{ ...mono }}>{r.amt}</span></div>
                <div style={{ fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{r.gp} · {r.w} ago</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '8px 10px', borderRadius: 8, background: 'var(--d2-cream)', border: hair, fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lu name="Info" size={12}/>
            <span>No OCR. The admin visually confirms the receipt matches the claimed amount.</span>
          </div>
        </WAPanel>
      </div>
    </div>
  );
}

Object.assign(window, { WAStoryboard });
