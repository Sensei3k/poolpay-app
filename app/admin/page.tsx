import { fetchGroups, fetchMembers, fetchCycles } from '@/lib/data';
import { ADMIN_TOKEN } from '@/lib/config';
import { AdminNav } from '@/app/admin/_components/admin-nav';

interface AdminPageProps {
  searchParams: Promise<{ group?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;

  const groupsResult = await fetchGroups();
  const groups = groupsResult.data;

  const selectedGroupId =
    params.group ??
    (groups.find(g => g.status === 'active')?.id ?? groups[0]?.id ?? '');

  const [membersResult, cyclesResult] = selectedGroupId
    ? await Promise.all([
        fetchMembers(selectedGroupId),
        fetchCycles(selectedGroupId),
      ])
    : [{ data: [], ok: true as const }, { data: [], ok: true as const }];

  const members = membersResult.data;
  const cycles = cyclesResult.data;

  return (
    <>
      <AdminNav />

      {!ADMIN_TOKEN && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400"
        >
          <strong>Warning:</strong> ADMIN_TOKEN is not set. Admin mutations will be rejected by the backend.
        </div>
      )}

      {!groupsResult.ok && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Could not reach the backend. Check that the Rust server is running.
        </div>
      )}

      <div className="space-y-10">
        <section aria-labelledby="groups-heading">
          <h2 id="groups-heading" className="text-lg font-semibold tracking-tight mb-4">Groups</h2>
          <pre className="text-xs text-muted-foreground">{JSON.stringify(groups, null, 2)}</pre>
        </section>

        <section aria-labelledby="members-heading">
          <h2 id="members-heading" className="text-lg font-semibold tracking-tight mb-4">Members</h2>
          <pre className="text-xs text-muted-foreground">{JSON.stringify(members, null, 2)}</pre>
        </section>

        <section aria-labelledby="cycles-heading">
          <h2 id="cycles-heading" className="text-lg font-semibold tracking-tight mb-4">Cycles</h2>
          <pre className="text-xs text-muted-foreground">{JSON.stringify(cycles, null, 2)}</pre>
        </section>
      </div>
    </>
  );
}
