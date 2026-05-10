// Shared shell for PoolPay app (Direction B)
// Single sidebar component, role-aware. Used by all desktop role views.

function PPSidebar({ role = 'member', current = 'home', pendingCount = null, activeGroup = 'Lagos Rent Q2' }) {
  const scopedGroups = [
    { id: 'lagos-rent-q2',   label: 'Lagos Rent Q2',    badge: '3' },
    { id: 'ibadan-trip',     label: 'Ibadan Trip 2026', badge: null },
    { id: 'chamasave-main',  label: 'ChamaSave · main', badge: '2' },
  ];
  const nav = [
    { id: 'home',     label: 'Home',      icon: 'House' },
    { id: 'pools',    label: 'Pools',     icon: 'UsersRound',   count: 6 },
    { id: 'activity', label: 'Activity',  icon: 'Waves' },
    { id: 'people',   label: 'People',    icon: 'Contact' },
    { id: 'inbox',    label: 'Inbox',     icon: 'Bell',         count: 3 },
  ];
  const showAdmin = role === 'admin' || role === 'super_admin';
  const showSystem = role === 'super_admin';
  const sidebarReceipts = pendingCount != null ? pendingCount
    : (role === 'super_admin' ? 47 : role === 'admin' ? 12 : null);
  const rolePill = {
    member:      { l: 'member',      bg: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)', fg: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' },
    admin:       { l: 'admin',       bg: 'var(--d2-accent-soft)',                              fg: 'var(--d2-accent)' },
    super_admin: { l: 'super_admin', bg: 'oklch(0.55 0.18 265 / 14%)',                         fg: 'oklch(0.55 0.18 265)' },
  }[role];

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="dot">P</span>
        <span className="word">PoolPay</span>
      </div>
      <div className="ctx-card">
        <div className="ctx-head"><span>Active pool</span><span className="switch">Switch</span></div>
        <div>
          <div className="ctx-name">{activeGroup}</div>
          <div className="kicker-mono" style={{ fontSize: '0.6875rem', marginTop: 2 }}>10 of 12 cycles · weekly</div>
        </div>
        <div className="ctx-bal"><span className="cur">₦</span>84,000</div>
        <div className="ctx-people">
          <div className="avatar-stack">
            <span className="avatar" style={{ background: 'oklch(0.72 0.13 38)',  color: 'white', border: 'none' }}>A</span>
            <span className="avatar" style={{ background: 'oklch(0.62 0.14 160)', color: 'white', border: 'none' }}>K</span>
            <span className="avatar" style={{ background: 'oklch(0.76 0.08 310)', color: 'white', border: 'none' }}>M</span>
            <span className="avatar">+2</span>
          </div>
          <span className="txt">5 members</span>
        </div>
      </div>
      <div className="sb-nav">
        {nav.map(it => (
          <a key={it.id} className={`sb-item ${current === it.id ? 'active' : ''}`}>
            <span className="ico"><Lu name={it.icon} size={17}/></span>
            <span className="label">{it.label}</span>
            {it.count != null && <span className="count">{it.count}</span>}
          </a>
        ))}
        <a className={`sb-item ${current === 'settings' ? 'active' : ''}`}>
          <span className="ico"><Lu name="Settings" size={17}/></span>
          <span className="label">Settings</span>
        </a>
      </div>
      {showAdmin && <>
        <div style={{ height: 1, background: 'color-mix(in oklch, currentColor 8%, transparent)', margin: '0.25rem 0' }}/>
        <div className="kicker-mono" style={{ padding: '0.25rem 0.75rem', fontSize: '0.625rem' }}>
          Administration{role === 'admin' && <span style={{ textTransform: 'none', letterSpacing: 0, marginLeft: 6, opacity: 0.7 }}>· scoped</span>}
        </div>
        <div className="sb-nav">
          <a className={`sb-item ${current === 'receipts' ? 'active' : ''}`}>
            <span className="ico"><Lu name="ReceiptText" size={17}/></span>
            <span className="label">Receipts queue</span>
            {sidebarReceipts > 0 && <span className="count" style={{ color: 'var(--ajo-outstanding)', fontWeight: 600 }}>{sidebarReceipts}</span>}
          </a>
          {role === 'admin' && scopedGroups.map(g => (
            <a key={g.id} className={`sb-item ${current === g.id ? 'active' : ''}`}>
              <span className="ico"><Lu name="Square" size={17}/></span>
              <span className="label">{g.label}</span>
              {g.badge && <span className="count" style={{ color: 'var(--ajo-outstanding)' }}>{g.badge}</span>}
            </a>
          ))}
        </div>
      </>}
      {showSystem && <>
        <div style={{ height: 1, background: 'color-mix(in oklch, currentColor 8%, transparent)', margin: '0.25rem 0' }}/>
        <div className="kicker-mono" style={{ padding: '0.25rem 0.75rem', fontSize: '0.625rem', color: 'oklch(0.55 0.18 265)' }}>
          System · super_admin
        </div>
        <div className="sb-nav">
          {[
            { id: 'sys-groups', label: 'Groups',         icon: 'Layers' },
            { id: 'sys-admins', label: 'Admins',         icon: 'ShieldCheck' },
            { id: 'sys-wa',     label: 'WhatsApp links', icon: 'MessageSquare' },
          ].map(it => (
            <a key={it.id} className={`sb-item ${current === it.id ? 'active' : ''}`}>
              <span className="ico"><Lu name={it.icon} size={17}/></span>
              <span className="label">{it.label}</span>
            </a>
          ))}
        </div>
      </>}
      <div className="sb-foot" style={{ marginTop: 'auto' }}>
        <span className="u-avatar">N</span>
        <span className="u-main">
          <span className="u-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Ngozi Okoye
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em', background: rolePill.bg, color: rolePill.fg, fontWeight: 500 }}>{rolePill.l}</span>
          </span>
          <span className="u-email">ngozi@chamasave.ng</span>
        </span>
        <button className="u-act"><Lu name="LogOut" size={15}/></button>
      </div>
    </aside>
  );
}

function PPTopbar({ title, sub, crumbs, showPay = false, actions = null }) {
  return (
    <div className="topbar">
      <div>
        {crumbs && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', letterSpacing: '0.03em', marginBottom: 2 }}>{crumbs}</div>}
        <div className="tb-title">{title}</div>
        {sub && <div className="tb-sub">{sub}</div>}
      </div>
      <div className="tb-spacer"/>
      <div className="tb-search"><Lu name="Search" size={14}/> Search</div>
      <button className="tb-btn"><Lu name="Bell" size={17}/></button>
      {actions}
      {showPay && <button className="tb-cta"><Lu name="Plus" size={14}/> Quick pay</button>}
    </div>
  );
}

function PPShell({ role, current, pendingCount, title, sub, crumbs, showPay, activeGroup, children, actions }) {
  return (
    <div className="vp d2" style={{ position: 'relative' }}>
      <PPSidebar role={role} current={current} pendingCount={pendingCount} activeGroup={activeGroup}/>
      <div className="main"><div className="main-inner">
        <PPTopbar title={title} sub={sub} crumbs={crumbs} showPay={showPay} actions={actions}/>
        <div className="content">{children}</div>
      </div></div>
    </div>
  );
}

// tiny shared bits
const mono = { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' };
const hair = '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)';
const card = { borderRadius: 14, background: 'var(--d2-cream)', border: hair };

Object.assign(window, { PPSidebar, PPTopbar, PPShell, mono, hair, card });
