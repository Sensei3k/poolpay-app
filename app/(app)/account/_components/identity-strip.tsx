import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/auth/verify-credentials";

type Props = {
  email: string;
  role: Role;
  sessionId?: string;
};

export function IdentityStrip({ email, role, sessionId }: Props) {
  const initial = email.trim()[0]?.toUpperCase() ?? "P";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ajo-paid-subtle font-semibold text-ajo-paid"
      >
        {initial}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{email}</span>
        <span className="truncate font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
          signed in
          {sessionId ? ` · session ${sessionId}` : null}
        </span>
      </div>
      <Badge
        variant="outline"
        className="shrink-0 font-mono text-[0.6875rem] lowercase tracking-wider"
      >
        {role}
      </Badge>
    </div>
  );
}
