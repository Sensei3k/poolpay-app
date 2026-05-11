import { notFound } from 'next/navigation';
import { SysWhatsAppView } from '@/components/super/sys-whatsapp-view';
import { getSystemWhatsAppFixture } from '@/lib/preview/super-fixtures';
import { SuperPreviewChrome } from '../_chrome';

export default function SysWhatsAppPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getSystemWhatsAppFixture();
  return (
    <SuperPreviewChrome current="sys-wa" title="WhatsApp links">
      <SysWhatsAppView
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        bot={fixture.bot}
      />
    </SuperPreviewChrome>
  );
}
