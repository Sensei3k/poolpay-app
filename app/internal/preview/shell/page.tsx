import { notFound } from "next/navigation";
import { PPShell } from "@/components/layout/pp-shell";
import {
  ROLES,
  type Role,
} from "@/lib/auth/verify-credentials";

/**
 * Dev-only preview harness for the slice-1 PPShell screenshot matrix.
 *
 * Renders `<PPShell>` with a fake user + active-group context for a
 * given role, so the 18-cell matrix (3 roles × 2 themes × 3 viewports)
 * can be captured without driving real auth + scoped DB fixtures
 * through every variant.
 *
 * **Hard-gated to non-production builds.** In production the route
 * returns 404 immediately, Next.js's `notFound()` triggers the
 * standard not-found rendering path and never leaks fake data into
 * production traffic. Removing the harness entirely is a follow-up; for
 * now the env gate is the load-bearing safety property.
 *
 * Query params:
 *   - `role`: `member` | `admin` | `super_admin` (default `member`)
 *   - `pending`: number, overrides the default pending-receipts count
 *
 * Example:
 *   /internal/preview/shell?role=admin
 *   /internal/preview/shell?role=super_admin&pending=7
 */

const PREVIEW_USER = {
  name: "Preview User",
  email: "preview@poolpay.test",
  initial: "P",
};

const PREVIEW_ACTIVE_GROUP = {
  name: "Lagos Pool · Weekly",
  meta: "10 of 12 cycles · weekly",
  balance: "₦84,000",
  memberCount: 12,
};

function parseRole(raw: string | string[] | undefined): Role {
  if (typeof raw !== "string") return "member";
  return (ROLES as readonly string[]).includes(raw)
    ? (raw as Role)
    : "member";
}

function parsePending(
  raw: string | string[] | undefined,
  fallback: number,
): number {
  if (typeof raw !== "string") return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function defaultPendingForRole(role: Role): number {
  if (role === "admin") return 3;
  if (role === "super_admin") return 7;
  return 0;
}

interface PreviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShellPreviewPage({
  searchParams,
}: PreviewPageProps) {
  // Hard fail-closed in production. The harness ships fake credentials
  // and skips all auth, must never resolve outside dev/test builds.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const role = parseRole(params.role);
  const pending = parsePending(params.pending, defaultPendingForRole(role));

  return (
    <PPShell
      role={role}
      current="home"
      title="Home"
      showQuickPay={role === "member"}
      crumbs={role === "super_admin" ? "System · super_admin" : undefined}
      pendingReceiptsCount={pending}
      user={PREVIEW_USER}
      activeGroup={PREVIEW_ACTIVE_GROUP}
    >
      <main id="main-content" className="space-y-6">
        <header>
          <p className="kicker-mono text-[0.6875rem] text-d2-ink/60">
            Preview · slice-1 shell harness
          </p>
          <h1 className="mt-1 text-[1.875rem] font-semibold tracking-tight text-d2-ink">
            Welcome back, Preview.
          </h1>
          <p className="mt-2 text-[0.95rem] text-d2-ink/65">
            This dev-only route mounts &lt;PPShell&gt; with a fake{" "}
            <code className="rounded bg-d2-ink/5 px-1 py-0.5 text-[0.85em]">
              {role}
            </code>{" "}
            user so the slice-1 screenshot matrix can capture sidebar
            role-gating, the active-group card, and the topbar without a
            full session.
          </p>
        </header>

        <section
          className="rounded-2xl border bg-white/70 p-6 shadow-sm"
          style={{
            borderColor: "color-mix(in oklch, var(--d2-ink) 8%, transparent)",
          }}
        >
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-d2-ink">
            Role coverage
          </h2>
          <ul className="mt-3 space-y-2 text-[0.9rem] text-d2-ink/75">
            <li>
              <strong className="text-d2-ink">member</strong>, primary nav
              only (Home, Pools, Activity, People, Inbox, Settings).
            </li>
            <li>
              <strong className="text-d2-ink">admin</strong>, primary +
              Administration section (Receipts queue with pending badge).
            </li>
            <li>
              <strong className="text-d2-ink">super_admin</strong>, primary
              + Administration + System (Groups, Admins, WhatsApp links).
            </li>
          </ul>
        </section>

        <section
          className="rounded-2xl border bg-white/70 p-6 shadow-sm"
          style={{
            borderColor: "color-mix(in oklch, var(--d2-ink) 8%, transparent)",
          }}
        >
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-d2-ink">
            How to capture
          </h2>
          <p className="mt-2 text-[0.9rem] text-d2-ink/75">
            Drive Playwright (or any headless browser) at{" "}
            <code className="rounded bg-d2-ink/5 px-1 py-0.5 text-[0.85em]">
              /internal/preview/shell?role=&lt;member|admin|super_admin&gt;
            </code>{" "}
            across the three viewport widths and both colour-scheme
            preferences. Capture the full viewport. Drop the resulting PNGs
            into <code>docs/screenshots/slice-1/</code>.
          </p>
        </section>
      </main>
    </PPShell>
  );
}
