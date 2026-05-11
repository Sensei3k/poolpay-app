import Link from 'next/link';

/**
 * Mobile/tablet banner rendered when a viewport <768px lands on `/sys/*`.
 *
 * Two consumers:
 *  1. The client guard in `app/(app)/sys/layout.tsx` runs a
 *     `router.replace('/home')` after a brief delay — during the
 *     flash before navigation the banner explains the redirect.
 *  2. The no-JS fallback CSS in the layout hides the route content and
 *     surfaces this banner alone, so users with JS off still see the
 *     redirect rationale (rather than a busted page).
 *
 * Keeps `data-role="sys-mobile-banner"` so the layout's CSS selector
 * can target it for the no-JS rule without inheriting from a broader
 * selector that other banners might match.
 */
export function DesktopOnlyBanner() {
  return (
    <div
      data-role="sys-mobile-banner"
      role="alert"
      className="mx-auto my-6 flex max-w-[420px] flex-col gap-3 rounded-2xl border p-5 text-center"
      style={{
        background: 'var(--accent-violet-subtle)',
        borderColor: 'color-mix(in oklch, var(--accent-violet) 30%, transparent)',
      }}
    >
      <h1
        className="text-base font-semibold tracking-tight"
        style={{ color: 'var(--accent-violet)' }}
      >
        Super-admin tools are desktop-only
      </h1>
      <p className="text-sm text-d2-ink/75">
        These screens manage tenants across the system. Reach for them on a wider screen
        (≥ 768px) so the cross-group tables stay readable.
      </p>
      <Link
        href="/home"
        className="inline-flex items-center justify-center gap-1 self-center rounded-[10px] px-4 py-2 text-sm font-medium text-white"
        style={{ background: 'var(--accent-violet)' }}
      >
        Go to home
      </Link>
    </div>
  );
}
