import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Group } from '@/lib/types';

interface GroupsSectionProps {
  groups: Group[];
}

export function GroupsSection({ groups }: GroupsSectionProps) {
  return (
    <section aria-labelledby="groups-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="groups-heading" className="text-lg font-semibold tracking-tight">
          Groups
        </h2>
        {/* GroupForm (Add) wired in commit 10 */}
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No groups found.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={group.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {group.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {group.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Edit/Delete wired in commit 10 */}
                    <span className="text-xs text-muted-foreground">—</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
