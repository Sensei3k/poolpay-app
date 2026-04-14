import { fetchGroups, fetchMembers, fetchCycles } from '@/lib/data';
import { ADMIN_TOKEN } from '@/lib/config';
import { AdminNav } from '@/app/admin/_components/admin-nav';
import { GroupTabs } from '@/app/admin/_components/group-tabs';
import { GroupsSection } from '@/app/admin/_components/groups-section';
import { MembersSection } from '@/app/admin/_components/members-section';
import { CyclesSection } from '@/app/admin/_components/cycles-section';

interface AdminPageProps {
  searchParams: Promise<{ group?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;

  const groupsResult = await fetchGroups();
  const groups = groupsResult.data;

  const fallbackGroupId =
    groups.find(g => g.status === 'active')?.id ?? groups[0]?.id ?? '';
  const selectedGroupId =
    params.group && groups.some(g => g.id === params.group)
      ? params.group
      : fallbackGroupId;

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

      <GroupTabs groups={groups} selectedGroupId={selectedGroupId} />

      <div className="space-y-10">
        <GroupsSection groups={groups} />

        <MembersSection members={members} groupId={selectedGroupId} />

        <CyclesSection cycles={cycles} members={members} groupId={selectedGroupId} />
      </div>
    </>
  );
}
