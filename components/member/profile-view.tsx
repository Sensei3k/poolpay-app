import Link from 'next/link';
import type { Role } from '@/lib/auth/verify-credentials';

const LANGUAGE_DEFAULT = 'English';

export interface ProfileViewProps {
  displayName: string;
  email: string;
  role: Role;
}

interface ProfileFieldRow {
  key: string;
  label: string;
  value: string;
  /** Optional trailing helper text under the value. */
  note?: string;
  /** Optional `href` for an inline edit affordance — `undefined` = read-only. */
  editHref?: string;
}

/**
 * Presentational `/profile` view. Identity strip, profile field list,
 * and a security panel that links into the existing change-password
 * flow at `/account/change-password` (FE-6).
 */
export function ProfileView({ displayName, email, role }: ProfileViewProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || '·';
  const profileFields: ReadonlyArray<ProfileFieldRow> = [
    { key: 'name', label: 'Display name', value: displayName },
    {
      key: 'phone',
      label: 'Phone',
      value: '+234 803 ··· ····',
      note: 'identity · used by WhatsApp bot to match your payments',
    },
    { key: 'email', label: 'Email', value: email },
    { key: 'language', label: 'Language', value: LANGUAGE_DEFAULT },
  ];

  return (
    <main
      id="main-content"
      aria-labelledby="profile-title"
      className="mx-auto flex max-w-[640px] flex-col gap-3"
    >
      <header className="hidden md:block">
        <p className="kicker-mono text-[10px]">Settings</p>
        <h1
          id="profile-title"
          className="mt-1 text-[1.5rem] font-semibold tracking-tight text-d2-ink"
        >
          Profile {"&"} security
        </h1>
        <p className="mt-1 text-[13px] text-d2-ink/55">
          Your account · {email || 'not set'}
        </p>
      </header>
      <h1 id="profile-title" className="sr-only md:hidden">
        Profile
      </h1>

      {/* Mobile identity card */}
      <section
        aria-label="Identity"
        className="flex flex-col items-center rounded-[14px] bg-d2-cream p-4 text-center md:hidden"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <span
          className="inline-flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-bold text-white"
          style={{
            background:
              'linear-gradient(135deg, var(--d2-coral), var(--d2-lav))',
          }}
          aria-hidden="true"
        >
          {initial}
        </span>
        <div className="mt-2.5 text-[17px] font-semibold text-d2-ink">
          {displayName}
        </div>
        <div className="text-[11px] text-d2-ink/55">{email}</div>
        <span
          className="mt-1 rounded px-2 py-px font-mono text-[10px]"
          style={{
            background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
            color: 'color-mix(in oklch, var(--d2-ink) 65%, transparent)',
          }}
        >
          {role}
        </span>
      </section>

      <section
        aria-labelledby="profile-section-title"
        className="rounded-[14px] bg-d2-cream p-4"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <h2 id="profile-section-title" className="kicker-mono mb-2 text-[10px]">
          Profile
        </h2>
        {/* Desktop identity strip */}
        <div className="mb-3 hidden items-center gap-3.5 md:flex">
          <span
            className="inline-flex items-center justify-center rounded-full text-[18px] font-bold text-white"
            style={{
              background:
                'linear-gradient(135deg, var(--d2-coral), var(--d2-lav))',
              width: 52,
              height: 52,
            }}
            aria-hidden="true"
          >
            {initial}
          </span>
          <div>
            <div className="text-[16px] font-semibold text-d2-ink">
              {displayName}
            </div>
            <div className="text-[13px] text-d2-ink/55">
              {email}
              <span className="px-2">·</span>
              {role}
            </div>
          </div>
        </div>
        <ul className="flex flex-col">
          {profileFields.map((field, i) => (
            <li
              key={field.key}
              className="grid grid-cols-[120px_1fr_auto] items-center gap-3 py-2 text-[13px]"
              style={
                i > 0
                  ? {
                      borderTop:
                        '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                    }
                  : undefined
              }
            >
              <span className="kicker-mono text-[10px]">{field.label}</span>
              <div className="min-w-0">
                <div className="truncate text-d2-ink">{field.value}</div>
                {field.note && (
                  <div className="text-[11px] text-d2-ink/50">{field.note}</div>
                )}
              </div>
              {field.editHref ? (
                <Link
                  href={field.editHref}
                  className="text-[12px] font-medium text-d2-accent"
                >
                  Edit
                </Link>
              ) : (
                <span className="text-[11px] text-d2-ink/40">read-only</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="profile-security-title"
        className="rounded-[14px] bg-d2-cream p-4"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <h2 id="profile-security-title" className="kicker-mono mb-2 text-[10px]">
          Security
        </h2>
        <ul className="flex flex-col">
          <li className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5">
            <div>
              <div className="text-[14px] font-medium text-d2-ink">
                Change password
              </div>
              <div className="text-[12px] text-d2-ink/55">
                Rotate your sign-in password.
              </div>
            </div>
            <Link
              href="/account/change-password"
              className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium"
              style={{
                background: 'var(--d2-ink)',
                color: 'var(--d2-warm-bg)',
              }}
            >
              Change
            </Link>
          </li>
          <li
            className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5"
            style={{
              borderTop:
                '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
            }}
          >
            <div>
              <div className="text-[14px] font-medium text-d2-ink">
                Active sessions
              </div>
              <div className="text-[12px] text-d2-ink/55">
                Review devices currently signed in.
              </div>
            </div>
            <button
              type="button"
              disabled
              aria-label="Manage sessions — coming in slice 6"
              title="Coming in slice 6"
              className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-90"
              style={{
                background: 'transparent',
                border:
                  '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)',
              }}
            >
              Manage
            </button>
          </li>
          <li
            className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5"
            style={{
              borderTop:
                '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
            }}
          >
            <div>
              <div
                className="text-[14px] font-medium"
                style={{ color: 'var(--destructive)' }}
              >
                Sign out everywhere
              </div>
              <div className="text-[12px] text-d2-ink/55">
                Ends sessions on all devices · live JWT dies within 15 min.
              </div>
            </div>
            <button
              type="button"
              disabled
              aria-label="Sign out everywhere — coming in slice 6"
              title="Coming in slice 6"
              className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-90"
              style={{
                background: 'transparent',
                border:
                  '1px solid color-mix(in oklch, var(--destructive) 40%, transparent)',
                color: 'var(--destructive)',
              }}
            >
              Sign out all
            </button>
          </li>
        </ul>
      </section>
    </main>
  );
}
