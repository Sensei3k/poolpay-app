// PoolPay · Missing screens for handoff
// Auth flows, error/offline, empty states, modals, loading skeletons,
// toasts, form states, creation flows.
// All use the d2 / shell tokens already in shell-styles.css.

const { useState: __useState } = React;

// ─── Reusable wrappers ───────────────────────────────────────────
// 4-dot diamond wordmark — verbatim from canonical signin.html
function Wordmark({ size = 18, showWord = true }) {
  const dot = size * 0.22;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
        {[
          { top: 0, left: size/2 - dot/2 },
          { top: size/2 - dot/2, left: 0 },
          { top: size/2 - dot/2, left: size - dot },
          { top: size - dot, left: size/2 - dot/2 },
        ].map((pos, i) => (
          <span key={i} style={{
            position: 'absolute', width: dot, height: dot, borderRadius: '50%',
            background: i === 3 ? 'var(--d2-accent)' : 'var(--d2-ink)', ...pos,
          }}/>
        ))}
      </span>
      {showWord && (
        <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em' }}>PoolPay</span>
      )}
    </span>
  );
}

function CenteredAuth({ children, kicker, showFooter = true }) {
  return (
    <div className="vp d2" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}>
        <Wordmark/>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>poolpay.ng</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {kicker && <div className="kicker-mono" style={{ fontSize: '0.6875rem' }}>{kicker}</div>}
          {children}
        </div>
      </div>
      {showFooter && (
        <div style={{ padding: '14px 24px', borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
          <span>poolpay · ajo for the diaspora</span>
          <span>v0.4 · 2026</span>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{children}</span>
      {hint && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{hint}</span>}
    </div>
  );
}
function Field({ label, hint, value = '', placeholder = '', state = 'default', help, type = 'text', icon }) {
  const stateStyles = {
    default: { border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)', background: 'var(--d2-cream)' },
    focus:   { border: '1.5px solid var(--d2-accent)', background: 'var(--d2-cream)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--d2-accent) 18%, transparent)' },
    error:   { border: '1.5px solid var(--destructive)', background: 'var(--d2-cream)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--destructive) 14%, transparent)' },
    disabled:{ border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)', background: 'color-mix(in oklch, var(--d2-ink) 4%, transparent)', opacity: 0.7 },
  }[state];
  const helpColor = state === 'error' ? 'var(--destructive)' : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)';
  return (
    <div>
      {label && <FieldLabel hint={hint}>{label}</FieldLabel>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, ...stateStyles }}>
        {icon && <Lu name={icon} size={15} style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}/>}
        <span style={{ flex: 1, fontSize: 14, color: value ? 'var(--d2-ink)' : 'color-mix(in oklch, var(--d2-ink) 40%, transparent)', fontVariantNumeric: type === 'otp' ? 'tabular-nums' : 'normal', fontFamily: type === 'otp' ? 'var(--font-mono)' : 'inherit', letterSpacing: type === 'otp' ? '0.4em' : 'normal' }}>
          {value || placeholder}
        </span>
        {state === 'focus' && <span style={{ width: 1.5, height: 16, background: 'var(--d2-accent)', animation: 'blink 1s steps(1) infinite' }}/>}
      </div>
      {help && <div style={{ marginTop: 6, fontSize: 11, color: helpColor, display: 'flex', alignItems: 'center', gap: 5 }}>
        {state === 'error' && <Lu name="AlertCircle" size={11}/>}
        {help}
      </div>}
    </div>
  );
}
function PrimaryBtn({ children, full, disabled, loading }) {
  return (
    <button style={{ padding: '11px 18px', borderRadius: 10, background: disabled ? 'color-mix(in oklch, var(--d2-ink) 25%, transparent)' : 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: 13.5, fontWeight: 600, width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
      {loading && <span style={{ width: 12, height: 12, borderRadius: 999, border: '1.5px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }}/>}
      {children}
    </button>
  );
}
function GhostBtn({ children, full }) {
  return <button style={{ padding: '11px 18px', borderRadius: 10, background: 'transparent', border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)', color: 'var(--d2-ink)', fontSize: 13.5, fontWeight: 500, width: full ? '100%' : 'auto', cursor: 'pointer' }}>{children}</button>;
}
function DangerBtn({ children }) {
  return <button style={{ padding: '11px 18px', borderRadius: 10, background: 'var(--destructive)', color: 'white', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>{children}</button>;
}

// ─── Dark canonical: tokens, rings, social glyphs ────────────────
// Matches the user's signed-off canonical: split layout, near-black bg,
// concentric rings + green dot motif, Instrument Serif headline, Google
// + GitHub social sign-in, vibrant green primary CTA.
const PP_DARK = {
  bg: '#000000',
  surface: '#0e0e10',
  surface2: '#1a1a1d',
  ink: '#f5f5f3',
  inkDim: 'rgba(245,245,243,0.62)',
  inkDimmer: 'rgba(245,245,243,0.42)',
  border: 'rgba(245,245,243,0.10)',
  borderStrong: 'rgba(245,245,243,0.18)',
  green: '#22c08e',           // signed-off "ajo green"
  greenInk: '#021a14',
};

function GoogleGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.6Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A9 9 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.05-2.33Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .92 4.96l3.05 2.33C4.68 5.16 6.66 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
function GitHubGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.68.41.36.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/>
    </svg>
  );
}
function DarkSocialBtn({ provider }) {
  const isGoogle = provider === 'google';
  return (
    <button style={{
      width: '100%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      padding: '14px 18px', borderRadius: 12,
      background: PP_DARK.surface2,
      border: '1px solid ' + PP_DARK.border,
      color: PP_DARK.ink,
      fontSize: 14, fontWeight: 500, cursor: 'pointer',
    }}>
      {isGoogle ? <GoogleGlyph/> : <GitHubGlyph/>}
      Continue with {isGoogle ? 'Google' : 'GitHub'}
    </button>
  );
}

// Concentric rings with a green dot. Position the dot via centerX/centerY
// (in viewBox units) so it can sit centered (auth) or off-axis (errors).
function PPRings({ size = 600, cx = 50, cy = 50, dotR = 5, rings = [10, 18, 26, 34, 42, 50], opacity = 0.18, dotColor = PP_DARK.green }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block' }}>
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={PP_DARK.ink} strokeOpacity={opacity * (1 - i * 0.08)} strokeWidth={0.18}/>
      ))}
      <circle cx={cx} cy={cy} r={dotR} fill={dotColor}/>
    </svg>
  );
}

// PoolPay wordmark for the dark canonical: green dot ring + "PoolPay" sans
function DarkWordmark() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ position: 'relative', width: 18, height: 18 }}>
        <span style={{ position: 'absolute', inset: 0, border: '1.5px solid ' + PP_DARK.green, borderRadius: '50%' }}/>
        <span style={{ position: 'absolute', top: 4, left: 4, width: 10, height: 10, borderRadius: '50%', background: PP_DARK.green }}/>
      </span>
      <span style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', color: PP_DARK.ink }}>PoolPay</span>
    </span>
  );
}

function NMark() {
  return (
    <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid ' + PP_DARK.borderStrong, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: PP_DARK.inkDim }}>N</span>
  );
}

// Dark input + primary CTA used across auth + error screens
function DarkField({ label, placeholder, value }) {
  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: PP_DARK.ink, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderRadius: 10, background: PP_DARK.surface2, border: '1px solid ' + PP_DARK.border, fontSize: 14, color: value ? PP_DARK.ink : PP_DARK.inkDimmer }}>
        {value || placeholder}
      </div>
    </div>
  );
}
function DarkPrimaryBtn({ children, full = true }) {
  return (
    <button style={{ width: full ? '100%' : 'auto', padding: '14px 22px', borderRadius: 10, background: PP_DARK.green, color: PP_DARK.greenInk, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }}>{children}</button>
  );
}
function DarkOutlineBtn({ children }) {
  return (
    <button style={{ padding: '12px 20px', borderRadius: 10, background: PP_DARK.surface2, color: PP_DARK.ink, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid ' + PP_DARK.border, display: 'inline-flex', alignItems: 'center', gap: 8 }}>{children}</button>
  );
}

// Editorial divider with "or" centered
function OrDivider({ label = 'or' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '6px 0' }}>
      <span style={{ flex: 1, height: 1, background: PP_DARK.border }}/>
      <span style={{ fontSize: 12.5, color: PP_DARK.inkDim }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: PP_DARK.border }}/>
    </div>
  );
}

// ─── 1. AUTH FLOWS ───────────────────────────────────────────────
// Dark canonical: split layout, Instrument Serif headline, concentric
// rings + green dot, Google + GitHub social. Matches user's signed-off
// design exactly; only colors/fonts moved into the rest of the system.
function DarkAuthFrame({ left, right }) {
  return (
    <div style={{ width: '100%', height: '100%', background: PP_DARK.bg, color: PP_DARK.ink, display: 'grid', gridTemplateColumns: '1fr 520px', overflow: 'hidden', fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}>
      {/* LEFT — brand + headline + rings */}
      <div style={{ position: 'relative', padding: '36px 44px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <DarkWordmark/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: PP_DARK.inkDim, letterSpacing: '0.04em' }}>est. 2026 · Lagos</span>
          <span style={{ width: 60 }}/>
        </div>
        {/* rings centered in remaining space */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <PPRings size={620} cx={50} cy={50} dotR={4.5}/>
        </div>
        {/* bottom-left content */}
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          {left}
          <div style={{ position: 'absolute', left: 0, bottom: -8 }}>
            <NMark/>
          </div>
        </div>
      </div>
      {/* RIGHT — form panel */}
      <div style={{ background: PP_DARK.surface, borderLeft: '1px solid ' + PP_DARK.border, padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}>
        {right}
      </div>
    </div>
  );
}

const HEADLINE_BLOCK = (
  <div style={{ marginLeft: 44 }}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: PP_DARK.green, textTransform: 'uppercase', marginBottom: 18 }}>A new kind of ajo</div>
    <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontWeight: 400, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink, maxWidth: 560 }}>
      Money you pool together <span style={{ color: PP_DARK.green }}>should feel</span> like money you trust together.
    </h2>
    <p style={{ fontSize: 14, lineHeight: 1.55, color: PP_DARK.inkDim, maxWidth: 460, marginTop: 22 }}>
      Cooperative finance, instrumented. Built for the way real groups already work — not a Silicon Valley reinvention of one.
    </p>
  </div>
);

function AuthSignIn() {
  return (
    <DarkAuthFrame
      left={HEADLINE_BLOCK}
      right={
        <div style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink }}>Sign in to PoolPay</h1>
            <p style={{ fontSize: 13.5, color: PP_DARK.inkDim, margin: '8px 0 0' }}>Use your organisation account to manage your ajo groups.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DarkSocialBtn provider="google"/>
            <DarkSocialBtn provider="github"/>
          </div>
          <OrDivider/>
          <DarkField label="Email" placeholder="you@company.com"/>
          <div>
            <DarkField label="Password" placeholder="Your password"/>
          </div>
          <DarkPrimaryBtn>Sign in</DarkPrimaryBtn>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
            <a style={{ fontSize: 13, color: PP_DARK.inkDim, textDecoration: 'underline', textUnderlineOffset: 3 }}>Forgot password?</a>
          </div>
          <div style={{ borderTop: '1px solid ' + PP_DARK.border, paddingTop: 14, fontSize: 12, color: PP_DARK.inkDimmer, textAlign: 'center' }}>
            By signing in you agree to the <span style={{ textDecoration: 'underline', color: PP_DARK.inkDim }}>Terms</span> and <span style={{ textDecoration: 'underline', color: PP_DARK.inkDim }}>Privacy Policy</span>.
          </div>
        </div>
      }
    />
  );
}

function AuthSignUp() {
  return (
    <DarkAuthFrame
      left={
        <div style={{ marginLeft: 44 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: PP_DARK.green, textTransform: 'uppercase', marginBottom: 18 }}>Invited to Lagos Rent Q2</div>
          <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontWeight: 400, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink, maxWidth: 560 }}>
            Adaeze O. invited you to <span style={{ color: PP_DARK.green }}>their ajo</span> — let's get you set up.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: PP_DARK.inkDim, maxWidth: 460, marginTop: 22 }}>
            Twelve members. ₦20,000 weekly. Cycle 4 starts Monday — you'll receive in week 9. Confirm your details to join.
          </p>
        </div>
      }
      right={
        <div style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink }}>Create your account</h1>
            <p style={{ fontSize: 13.5, color: PP_DARK.inkDim, margin: '8px 0 0' }}>Continue with a provider, or use your phone number.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DarkSocialBtn provider="google"/>
            <DarkSocialBtn provider="github"/>
          </div>
          <OrDivider/>
          <DarkField label="Your name" value="Tola Bakare"/>
          <DarkField label="Phone number" value="+234 803 ••• 4218"/>
          <DarkField label="Email (optional)" placeholder="for receipts & statements"/>
          <DarkPrimaryBtn>Create account &amp; join pool</DarkPrimaryBtn>
          <div style={{ borderTop: '1px solid ' + PP_DARK.border, paddingTop: 14, fontSize: 12, color: PP_DARK.inkDimmer, textAlign: 'center' }}>
            By continuing you agree to the <span style={{ textDecoration: 'underline', color: PP_DARK.inkDim }}>Terms</span> and <span style={{ textDecoration: 'underline', color: PP_DARK.inkDim }}>Privacy Policy</span>.
          </div>
        </div>
      }
    />
  );
}

function AuthForgot() {
  return (
    <DarkAuthFrame
      left={
        <div style={{ marginLeft: 44 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: PP_DARK.green, textTransform: 'uppercase', marginBottom: 18 }}>Reset password</div>
          <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontWeight: 400, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink, maxWidth: 560 }}>
            Check your <span style={{ color: PP_DARK.green }}>WhatsApp</span> — we just sent a 6-digit code.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: PP_DARK.inkDim, maxWidth: 460, marginTop: 22 }}>
            Phone-first recovery is faster than email and matches how the group already coordinates. Codes expire after 10 minutes.
          </p>
        </div>
      }
      right={
        <div style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.015em', margin: 0, color: PP_DARK.ink }}>Verify it's you</h1>
            <p style={{ fontSize: 13.5, color: PP_DARK.inkDim, margin: '8px 0 0' }}>Code sent to <strong style={{ color: PP_DARK.ink, fontWeight: 600 }}>+234 803 ••• 4218</strong></p>
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>Verification code</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {['2','4','8','·','·','·'].map((c, i) => (
                <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: PP_DARK.surface2, border: '1px solid ' + (i < 3 ? PP_DARK.borderStrong : PP_DARK.border), fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: i < 3 ? PP_DARK.ink : PP_DARK.inkDimmer }}>{c}</div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: PP_DARK.inkDim }}>Code expires in <span style={{ fontFamily: 'var(--font-mono)', color: PP_DARK.ink }}>9:48</span></div>
          </div>
          <DarkPrimaryBtn>Verify &amp; continue</DarkPrimaryBtn>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: PP_DARK.inkDim }}>Didn't get a code?</span>
            <span style={{ color: PP_DARK.green, fontWeight: 500 }}>Resend in 0:42</span>
          </div>
        </div>
      }
    />
  );
}

// ─── 2. ERROR / OFFLINE ──────────────────────────────────────────
// Dark canonical: PoolPay wordmark top-left, status pill top-right,
// big numeric/letter glyph centered, kicker + serif headline + body,
// two CTAs (filled green primary + outline ghost). Rings sit off-axis
// to the right for visual rhythm. Matches signed-off 404 design.
function DarkErrorFrame({ status, glyph, kicker, headline, body, primary, secondary, ringsCx = 100, ringsCy = 60 }) {
  return (
    <div style={{ width: '100%', height: '100%', background: PP_DARK.bg, color: PP_DARK.ink, position: 'relative', overflow: 'hidden', fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}>
      {/* off-axis rings backdrop */}
      <div style={{ position: 'absolute', right: -200, top: '50%', transform: 'translateY(-50%)', opacity: 0.9 }}>
        <PPRings size={780} cx={ringsCx} cy={ringsCy} dotR={4}/>
      </div>
      {/* top bar */}
      <div style={{ position: 'absolute', top: 36, left: 44, right: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        <DarkWordmark/>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, border: '1px solid ' + PP_DARK.borderStrong, fontFamily: 'var(--font-mono)', fontSize: 12, color: PP_DARK.ink }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: PP_DARK.green }}/>
          {status}
        </div>
      </div>
      {/* center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: '0 60px' }}>
        <div style={{
          fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: 220, lineHeight: 0.9, letterSpacing: '-0.05em',
          background: 'linear-gradient(180deg, #ffffff 0%, #c8c8c4 55%, #5a5a57 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          marginBottom: 0,
        }}>{glyph}</div>
        <div style={{ width: 36, height: 3, background: PP_DARK.green, borderRadius: 2, margin: '6px 0 22px' }}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', color: PP_DARK.green, textTransform: 'uppercase', marginBottom: 18, textAlign: 'center' }}>{kicker}</div>
        <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontWeight: 400, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.015em', margin: 0, textAlign: 'center', maxWidth: 780, color: PP_DARK.ink }}>
          {headline}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: PP_DARK.inkDim, marginTop: 22, marginBottom: 36, textAlign: 'center', maxWidth: 560 }}>{body}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {primary && <DarkPrimaryBtn full={false}>{primary}</DarkPrimaryBtn>}
          {secondary && <DarkOutlineBtn>{secondary}</DarkOutlineBtn>}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 36, bottom: 32, zIndex: 2 }}><NMark/></div>
    </div>
  );
}
function Err404() {
  return (
    <DarkErrorFrame
      status="HTTP 404 · route not found"
      glyph="404"
      kicker="this page isn't in the pool"
      headline={<>We looked everywhere — <span style={{ color: PP_DARK.green }}>this route doesn't exist</span> on PoolPay.</>}
      body="The link may be stale, the group archived, or a collaborator's invite out of date. Nothing is broken on your side."
      primary={<><Lu name="Home" size={14} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Back to dashboard</>}
      secondary={<><Lu name="ArrowLeft" size={14}/>Go back</>}
    />
  );
}
function Err500() {
  return (
    <DarkErrorFrame
      status="HTTP 500 · server error"
      glyph="500"
      kicker="our pumps aren't catching"
      headline={<>Something on <span style={{ color: PP_DARK.green }}>our side</span> went wrong — your money is safe.</>}
      body="No transaction was processed. Our team has been notified and is looking into it. Try again in a moment."
      primary={<><Lu name="RotateCcw" size={14} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Try again</>}
      secondary={<>Copy trace · 8f3c·91ab</>}
      ringsCx={0} ringsCy={50}
    />
  );
}
function ErrOffline() {
  return (
    <DarkErrorFrame
      status="connection lost"
      glyph={<Lu name="WifiOff" size={180} strokeWidth={1.5} style={{ color: PP_DARK.inkDim }}/>}
      kicker="you're flying blind"
      headline={<>You appear to be <span style={{ color: PP_DARK.green }}>offline</span> — we'll catch up when you're back.</>}
      body="Pending payments are queued locally and will retry automatically. Pull-to-refresh once your connection returns."
      primary={<><Lu name="RotateCcw" size={14} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Retry now</>}
      secondary={<>View cached groups</>}
      ringsCx={50} ringsCy={50}
    />
  );
}
// ─── 3. EMPTY STATES ─────────────────────────────────────────────
function EmptyMember() {
  return (
    <PPShell role="member" current="home" title="Home" sub="Welcome to PoolPay" showPay>
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: 18, background: 'linear-gradient(135deg, var(--d2-accent), var(--d2-lav))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px -8px color-mix(in oklch, var(--d2-accent) 50%, transparent)' }}>
            <Lu name="UsersRound" size={32} style={{ color: 'white' }}/>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>You haven't joined a pool yet.</h2>
          <p style={{ fontSize: 13.5, color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', margin: '0 0 22px', lineHeight: 1.5 }}>Pools (also called <em>ajo</em>, <em>esusu</em>, or <em>chama</em>) let a group save together — everyone contributes on the same schedule, and one person collects each cycle.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            <PrimaryBtn>Join with invite code</PrimaryBtn>
            <GhostBtn>Ask to be invited</GhostBtn>
          </div>
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'color-mix(in oklch, var(--d2-ink) 4%, transparent)', display: 'flex', gap: 10, textAlign: 'left', fontSize: 12, color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)', lineHeight: 1.5 }}>
            <Lu name="MessageSquare" size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--d2-accent)' }}/>
            <span>Already part of an ajo on WhatsApp? Ask the admin to link your phone number — your existing payments will appear here.</span>
          </div>
        </div>
      </div>
    </PPShell>
  );
}

function EmptyInbox() {
  return (
    <PPShell role="member" current="inbox" title="Inbox" sub="0 unread" showPay>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'color-mix(in oklch, var(--d2-ink) 5%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>
            <Lu name="Inbox" size={24}/>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>You're all caught up.</h3>
          <p style={{ fontSize: 12.5, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', margin: 0, lineHeight: 1.5 }}>Receipt confirmations, payout reminders, and admin messages will appear here.</p>
        </div>
      </div>
    </PPShell>
  );
}

function EmptyAdmins() {
  return (
    <PPShell role="super_admin" current="sys-admins" title="Admins" sub="0 admins · system-wide" showPay={false} actions={<button className="tb-cta"><Lu name="Plus" size={14}/> Add admin</button>}>
      <div style={{ border: '1px dashed color-mix(in oklch, var(--d2-ink) 18%, transparent)', borderRadius: 14, padding: '48px 32px', textAlign: 'center' }}>
        <Lu name="ShieldCheck" size={28} style={{ color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)', marginBottom: 12 }}/>
        <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>No admins yet.</h3>
        <p style={{ fontSize: 12.5, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)', margin: '0 0 18px', maxWidth: 360, marginInline: 'auto', lineHeight: 1.5 }}>Admins handle receipt confirmation for the groups you grant them. Create one to get started — they'll receive temporary credentials you can pass on.</p>
          <PrimaryBtn>Add first admin</PrimaryBtn>
      </div>
    </PPShell>
  );
}

// ─── 4. MODALS / CONFIRMS ────────────────────────────────────────
function ModalShell({ children, w = 460, title, sub, kicker, onClose, footerLeft, footerRight, dim = true }) {
  return (
    <div className="vp d2" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, filter: 'blur(2px)', pointerEvents: 'none' }}>
        <PPShell role="member" current="pools" title="Lagos Rent Q2" crumbs="Pools / Lagos Rent Q2" sub="weekly · cycle 10 of 12">
          <div style={{ height: 200 }}/>
        </PPShell>
      </div>
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in oklch, var(--d2-ink) 35%, transparent)', backdropFilter: 'blur(3px)' }}/>}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: w, background: 'var(--d2-cream)', borderRadius: 18, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {kicker && <div className="kicker-mono" style={{ fontSize: 10, marginBottom: 4 }}>{kicker}</div>}
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}>{title}</h3>
                {sub && <p style={{ fontSize: 12.5, color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', margin: '4px 0 0', lineHeight: 1.45 }}>{sub}</p>}
              </div>
              <button style={{ width: 30, height: 30, borderRadius: 8, color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}><Lu name="X" size={16}/></button>
            </div>
          </div>
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
          {(footerLeft || footerRight) && (
            <div style={{ padding: '14px 22px', borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'color-mix(in oklch, var(--d2-ink) 2%, transparent)' }}>
              <div>{footerLeft}</div>
              <div style={{ display: 'flex', gap: 8 }}>{footerRight}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalPayConfirm() {
  return (
    <ModalShell w={460} kicker="Pay · cycle 10" title="Confirm contribution" sub="You're paying ₦ 12,000 to Lagos Rent Q2 · week of 22 Apr."
      footerLeft={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>can be undone within 24h</span>}
      footerRight={<><GhostBtn>Cancel</GhostBtn><PrimaryBtn>Confirm & upload receipt</PrimaryBtn></>}>
      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'color-mix(in oklch, var(--d2-accent) 8%, transparent)', border: '1px solid color-mix(in oklch, var(--d2-accent) 25%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Send to</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>Adaeze Okonkwo · GTBank</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)', marginTop: 2 }}>0143 ••• 8821</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>Amount</div>
          <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>₦ 12,000</div>
        </div>
      </div>
      <Field label="Reference / memo" hint="optional" value="LRQ2 · w10 · Tola"/>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--d2-ink) 4%, transparent)' }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--d2-accent)', background: 'var(--d2-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lu name="Check" size={11} style={{ color: 'white' }}/>
        </span>
        <span style={{ fontSize: 12.5, color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)' }}>Notify the WhatsApp group when admin confirms</span>
      </div>
    </ModalShell>
  );
}

function ModalReceiptDetail() {
  return (
    <ModalShell w={620} kicker="Receipt · #R-7782" title="Tola B. → Lagos Rent Q2 · week 10" sub="Submitted via WhatsApp · 22 Apr 18:42 · matched on phone +234 803 ••• 4218"
      footerRight={<><GhostBtn>Reject as duplicate</GhostBtn><DangerBtn>Mark as suspicious</DangerBtn><PrimaryBtn>Confirm payment</PrimaryBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
        <div style={{ aspectRatio: '3/4', borderRadius: 10, background: 'repeating-linear-gradient(135deg, color-mix(in oklch, var(--d2-ink) 5%, transparent) 0 6px, transparent 6px 12px), color-mix(in oklch, var(--d2-ink) 4%, transparent)', border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em' }}>
          <Lu name="Image" size={20}/>
          <span>screenshot</span>
          <span style={{ fontSize: 9 }}>820 × 1100</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Sender',     'Tola Bakare · +234 803 ••• 4218', 'matched 100%'],
            ['Cycle',      'Lagos Rent Q2 · cycle 10 of 12',  null],
            ['Expected',   '₦ 12,000', null],
            ['Received',   '₦ 12,000', 'amount matches'],
            ['Bank trace', 'GTB · ref 8917-2204', null],
            ['Submitted',  '22 Apr 2026 · 18:42 WAT', 'WhatsApp · Lagos Rent Group'],
          ].map(([k, v, note]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, fontSize: 12.5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>{k}</span>
              <span><span style={{ fontWeight: 500 }}>{v}</span>{note && <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ajo-paid)' }}>· {note}</span>}</span>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function ModalDeleteConfirm() {
  return (
    <ModalShell w={420} kicker="Destructive" title="Remove Tola from Lagos Rent Q2?" sub="They have ₦ 24,000 outstanding across 2 cycles. Removing them won't refund — settle their balance first."
      footerRight={<><GhostBtn>Cancel</GhostBtn><DangerBtn>Remove member</DangerBtn></>}>
      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'color-mix(in oklch, var(--destructive) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--destructive) 25%, transparent)', display: 'flex', gap: 10 }}>
        <Lu name="AlertTriangle" size={16} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }}/>
        <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--destructive)' }}>This cannot be undone.</strong> Tola will lose access to the pool. Their past contributions stay on the cycle log for audit.
        </div>
      </div>
      <Field label="Type REMOVE to confirm" placeholder="REMOVE" state="default"/>
    </ModalShell>
  );
}

function ModalCreateCycle() {
  return (
    <ModalShell w={500} kicker="Admin · Lagos Rent Q2" title="Start cycle 11" sub="The roster is locked at the start of each cycle. Once started, you can only adjust amounts with member sign-off."
      footerLeft={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>auto-notifies WhatsApp group</span>}
      footerRight={<><GhostBtn>Cancel</GhostBtn><PrimaryBtn>Start cycle</PrimaryBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Contribution" value="₦ 12,000"/>
        <Field label="Due date" value="Mon 28 Apr 2026"/>
      </div>
      <div>
        <FieldLabel hint="based on draw order">Recipient · cycle 11</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--d2-cream)', border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)' }}>
          <span className="avatar lg" style={{ background: 'oklch(0.76 0.08 310)', color: 'white', border: 'none' }}>M</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Moyo Ibrahim</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}>position 11 of 12 · last received: never</div>
          </div>
          <button style={{ fontSize: 11.5, color: 'var(--d2-accent)', fontWeight: 600 }}>Override</button>
        </div>
      </div>
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--ajo-outstanding) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--ajo-outstanding) 25%, transparent)', display: 'flex', gap: 10, fontSize: 12.5 }}>
        <Lu name="AlertCircle" size={14} style={{ color: 'oklch(0.55 0.14 70)', flexShrink: 0, marginTop: 2 }}/>
        <span style={{ color: 'oklch(0.45 0.14 70)' }}>1 member is still outstanding on cycle 10. Starting cycle 11 will close cycle 10 and roll their balance forward.</span>
      </div>
    </ModalShell>
  );
}

function ModalCreateGroup() {
  return (
    <ModalShell w={540} kicker="Super-admin" title="Create new pool" sub="The group goes live immediately. You'll assign a scoped admin in the next step."
      footerRight={<><GhostBtn>Cancel</GhostBtn><PrimaryBtn>Create pool · then assign admin</PrimaryBtn></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Pool name" value="Lagos Rent Q3"/>
        <Field label="Currency" value="NGN"/>
        <Field label="Cadence" value="Weekly"/>
        <Field label="Default contribution" value="₦ 12,000"/>
        <Field label="Cycles" value="12"/>
        <Field label="Start date" value="Mon 5 May 2026"/>
      </div>
      <Field label="WhatsApp group link" hint="optional · for receipt matching" value="" placeholder="https://chat.whatsapp.com/…" icon="MessageSquare"/>
    </ModalShell>
  );
}

// ─── 5. LOADING SKELETONS ────────────────────────────────────────
function Skel({ w = '100%', h = 14, r = 6, style = {} }) {
  return <span style={{ display: 'inline-block', width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, color-mix(in oklch, var(--d2-ink) 6%, transparent) 0%, color-mix(in oklch, var(--d2-ink) 11%, transparent) 50%, color-mix(in oklch, var(--d2-ink) 6%, transparent) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s ease-in-out infinite', ...style }}/>;
}
function LoadingHome() {
  return (
    <PPShell role="member" current="home" title="Home" sub="Loading…" showPay>
      <div style={{ marginBottom: 22 }}>
        <Skel w={120} h={11} style={{ marginBottom: 12 }}/>
        <Skel w="60%" h={32}/>
        <div style={{ marginTop: 8 }}><Skel w="42%" h={32}/></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ padding: 16, borderRadius: 14, border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skel w="50%" h={10}/>
            <Skel w="70%" h={22}/>
            <Skel w="40%" h={11}/>
          </div>
        ))}
      </div>
      <Skel w={120} h={14} style={{ marginBottom: 12 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ padding: 14, borderRadius: 14, border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skel w={34} h={34} r={10}/>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Skel w="55%" h={13}/>
                <Skel w="38%" h={10}/>
              </div>
            </div>
            <Skel h={4} r={999}/>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><Skel w={60} h={10}/><Skel w={70} h={11}/></div>
          </div>
        ))}
      </div>
    </PPShell>
  );
}
function LoadingTable() {
  return (
    <PPShell role="admin" current="receipts" title="Receipts queue" sub="Loading…" pendingCount={null}>
      <div style={{ borderRadius: 14, border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)', display: 'flex', justifyContent: 'space-between' }}>
          <Skel w={140} h={14}/>
          <Skel w={80} h={11}/>
        </div>
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.6fr 0.4fr', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skel w={26} h={26} r={999}/>
              <Skel w="60%" h={12}/>
            </div>
            <Skel w="55%" h={11}/>
            <Skel w="40%" h={11}/>
            <Skel w={70} h={20} r={6}/>
            <Skel w={20} h={20} r={6}/>
          </div>
        ))}
      </div>
    </PPShell>
  );
}

// ─── 6. TOASTS / BANNERS ─────────────────────────────────────────
function ToastsScene() {
  const toasts = [
    { tone: 'success', icon: 'CheckCircle2', t: 'Receipt confirmed', s: 'Tola B. · ₦ 12,000 · cycle 10' },
    { tone: 'info',    icon: 'Info',         t: 'Cycle 11 starts in 3 days', s: 'Notify members? Send reminder →' },
    { tone: 'warning', icon: 'AlertCircle',  t: '1 receipt is older than 48h', s: 'Old receipts may be duplicates' },
    { tone: 'error',   icon: 'AlertTriangle',t: 'Could not save settings', s: 'Network error · retry available' },
  ];
  const colors = {
    success: { bg: 'color-mix(in oklch, var(--ajo-paid) 12%, var(--d2-cream))', bd: 'color-mix(in oklch, var(--ajo-paid) 30%, transparent)', ic: 'var(--ajo-paid)' },
    info:    { bg: 'color-mix(in oklch, var(--d2-accent) 8%, var(--d2-cream))', bd: 'color-mix(in oklch, var(--d2-accent) 25%, transparent)', ic: 'var(--d2-accent)' },
    warning: { bg: 'color-mix(in oklch, var(--ajo-outstanding) 12%, var(--d2-cream))', bd: 'color-mix(in oklch, var(--ajo-outstanding) 30%, transparent)', ic: 'oklch(0.55 0.14 70)' },
    error:   { bg: 'color-mix(in oklch, var(--destructive) 10%, var(--d2-cream))', bd: 'color-mix(in oklch, var(--destructive) 28%, transparent)', ic: 'var(--destructive)' },
  };
  return (
    <PPShell role="member" current="home" title="Toasts & banners" sub="Patterns shown together for handoff reference">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="kicker-mono" style={{ marginBottom: 10 }}>Toast (transient · 5s)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {toasts.map((t, i) => {
              const c = colors[t.tone];
              return (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: c.bg, border: `1px solid ${c.bd}`, display: 'flex', gap: 11, alignItems: 'flex-start', boxShadow: '0 8px 22px -10px rgba(0,0,0,0.15)' }}>
                  <Lu name={t.icon} size={17} style={{ color: c.ic, flexShrink: 0, marginTop: 1 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.t}</div>
                    <div style={{ fontSize: 11.5, color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', marginTop: 2 }}>{t.s}</div>
                  </div>
                  <button style={{ width: 22, height: 22, borderRadius: 6, color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}><Lu name="X" size={13}/></button>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="kicker-mono" style={{ marginBottom: 10 }}>Inline banner (persistent)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'color-mix(in oklch, var(--d2-accent) 8%, var(--d2-cream))', border: '1px solid color-mix(in oklch, var(--d2-accent) 25%, transparent)', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <Lu name="Sparkles" size={16} style={{ color: 'var(--d2-accent)', flexShrink: 0, marginTop: 2 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Add a payout method</div>
                <div style={{ fontSize: 12, color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}>You haven't set up a bank account yet. Required before your cycle 13 payout.</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button style={{ padding: '5px 10px', borderRadius: 8, background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)', fontSize: 11.5, fontWeight: 600 }}>Set up now</button>
                  <button style={{ padding: '5px 10px', borderRadius: 8, background: 'transparent', color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)', fontSize: 11.5, fontWeight: 500 }}>Remind me later</button>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'color-mix(in oklch, var(--destructive) 8%, var(--d2-cream))', border: '1px solid color-mix(in oklch, var(--destructive) 25%, transparent)', display: 'flex', gap: 11 }}>
              <Lu name="AlertTriangle" size={16} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 2 }}/>
              <div style={{ flex: 1, fontSize: 12.5, color: 'color-mix(in oklch, var(--d2-ink) 75%, transparent)' }}>
                <strong>Pool paused.</strong> 3 members are >7 days overdue. The admin must resolve before the next cycle starts.
              </div>
            </div>
          </div>
          <div className="kicker-mono" style={{ marginTop: 22, marginBottom: 10 }}>Inline form helper</div>
          <Field label="Phone number" value="+234 803 555 4218" state="error" help="A member with this phone is already in the pool"/>
        </div>
      </div>
    </PPShell>
  );
}

// ─── Mobile auth (responsive) ────────────────────────────────────
function MM_SignIn() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: PP_DARK.bg, color: PP_DARK.ink, borderRadius: 22, display: 'flex', flexDirection: 'column', padding: '24px 22px', fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}><DarkWordmark/></div>
      <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 30, fontWeight: 400, letterSpacing: '-0.015em', margin: '0 0 6px', lineHeight: 1.1, color: PP_DARK.ink }}>Sign in to PoolPay</h1>
      <p style={{ fontSize: 13, color: PP_DARK.inkDim, margin: '0 0 18px' }}>Use your organisation account.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <DarkSocialBtn provider="google"/>
        <DarkSocialBtn provider="github"/>
      </div>
      <OrDivider/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginTop: 6 }}>
        <DarkField label="Email" placeholder="you@company.com"/>
        <DarkField label="Password" placeholder="Your password"/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <DarkPrimaryBtn>Sign in</DarkPrimaryBtn>
        <p style={{ fontSize: 11.5, color: PP_DARK.inkDimmer, textAlign: 'center', margin: 0 }}>
          By signing in you agree to the Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// ─── Form states reference (single artboard) ─────────────────────
function FormStatesRef() {
  return (
    <PPShell role="member" current="home" title="Form states · reference" sub="For developer reference — every input variant in one place">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, maxWidth: 800 }}>
        <Field label="Default · empty" placeholder="ngozi@chamasave.ng" icon="Mail"/>
        <Field label="Default · filled" value="ngozi@chamasave.ng" icon="Mail"/>
        <Field label="Focus" value="+234 803 555" icon="Phone" state="focus" help="Continue typing — we'll send the code when ready"/>
        <Field label="Error" value="123" icon="Phone" state="error" help="Phone number must include country code"/>
        <Field label="Disabled" value="locked@account.ng" icon="Mail" state="disabled" help="Reach out to support to change this"/>
        <Field label="With hint" value="₦ 12,000" hint="weekly" icon="HandCoins"/>
      </div>
      <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <PrimaryBtn>Primary</PrimaryBtn>
        <PrimaryBtn loading>Loading</PrimaryBtn>
        <PrimaryBtn disabled>Disabled</PrimaryBtn>
        <GhostBtn>Ghost</GhostBtn>
        <DangerBtn>Danger</DangerBtn>
      </div>
    </PPShell>
  );
}

// keyframes injected once
if (!document.getElementById('__pp_kf')) {
  const s = document.createElement('style');
  s.id = '__pp_kf';
  s.textContent = `
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 50% { opacity: 0; } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  AuthSignIn, AuthSignUp, AuthForgot,
  Err404, Err500, ErrOffline,
  EmptyMember, EmptyInbox, EmptyAdmins,
  ModalPayConfirm, ModalReceiptDetail, ModalDeleteConfirm, ModalCreateCycle, ModalCreateGroup,
  LoadingHome, LoadingTable,
  ToastsScene, FormStatesRef, MM_SignIn,
});
