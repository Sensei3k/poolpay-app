import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Layout for the `/admin/*` admin surface.
 *
 * Two responsibilities:
 *  1. Server-side role gate. Anyone whose session role is not `admin`
 *     or `super_admin` is redirected to `/home` before the route HTML
 *     renders. The backend already rejects admin mutations from non-
 *     admin sessions; this gate stops the admin shell and any data the
 *     backend returns to authenticated callers from leaking to members
 *     who guess the URL.
 *  2. Plain layout wrapper. Each admin page owns its own
 *     `<main id="main-content">` landmark, so this layout must not add
 *     another `<main>`, nesting them violates HTML5 and breaks the
 *     skip-link target.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }
  const role = session.user.role;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/home');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
