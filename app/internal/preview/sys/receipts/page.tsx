import { notFound } from 'next/navigation';
import { SysReceiptsView } from '@/components/super/sys-receipts-view';
import { getSystemReceiptsFixture } from '@/lib/preview/super-fixtures';
import { SuperPreviewChrome } from '../_chrome';

/**
 * Dev-only preview of `/sys/receipts`. Mirrors the production page but
 * mounts `<PPShell>` with a fake super_admin session so the
 * slice-4 screenshot matrix can capture the surface without driving
 * real auth.
 */
export default function SysReceiptsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getSystemReceiptsFixture();
  return (
    <SuperPreviewChrome current="sys-receipts" title="Receipts queue">
      <SysReceiptsView rows={fixture.rows} aggregates={fixture.aggregates} />
    </SuperPreviewChrome>
  );
}
