import { notFound } from 'next/navigation';
import { SysGroupsView } from '@/components/super/sys-groups-view';
import { getSystemGroupsFixture } from '@/lib/preview/super-fixtures';
import { SuperPreviewChrome } from '../_chrome';

export default function SysGroupsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getSystemGroupsFixture();
  return (
    <SuperPreviewChrome current="sys-groups" title="Groups">
      <SysGroupsView rows={fixture.rows} aggregates={fixture.aggregates} />
    </SuperPreviewChrome>
  );
}
