import { notFound } from 'next/navigation';
import { SysAdminsView } from '@/components/super/sys-admins-view';
import { getSystemAdminsFixture } from '@/lib/preview/super-fixtures';
import { SuperPreviewChrome } from '../_chrome';

export default function SysAdminsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getSystemAdminsFixture();
  return (
    <SuperPreviewChrome current="sys-admins" title="Admins">
      <SysAdminsView
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupOptions={fixture.groupOptions}
      />
    </SuperPreviewChrome>
  );
}
