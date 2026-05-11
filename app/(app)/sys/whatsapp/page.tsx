import { SysWhatsAppView } from '@/components/super/sys-whatsapp-view';
import { getSystemWhatsAppFixture } from '@/lib/preview/super-fixtures';

export const metadata = {
  title: 'WhatsApp links · PoolPay',
  description: 'Bot health and per-pool WhatsApp pairing for super-admin operators.',
};

/**
 * `/sys/whatsapp`, bot health + per-pool link status.
 *
 * FIXME(BE-9): the WhatsApp link metadata (drift, pending, unlinked)
 * is derived from the bot's matcher service in poolpay-api (webhook
 * receiver + matcher), which is not yet exposed. Until that endpoint
 * lands, the page renders the fixture so operators can see the surface
 * and the screenshot matrix can capture every status.
 */
export default function SysWhatsAppPage() {
  const fixture = getSystemWhatsAppFixture();
  return (
    <SysWhatsAppView
      rows={fixture.rows}
      aggregates={fixture.aggregates}
      bot={fixture.bot}
    />
  );
}
