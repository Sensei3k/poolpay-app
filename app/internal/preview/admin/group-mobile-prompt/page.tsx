import { notFound } from 'next/navigation';
import { MobileReadonlyPrompt } from '@/components/admin/mobile-readonly-prompt';
import { AdminPreviewChrome } from '../_chrome';

/**
 * Standalone preview of the desktop-only prompt. The real surface
 * inlines this card on mobile when the active tab is in
 * `MOBILE_BLOCKED_TABS`, this route captures the card in isolation
 * so the screenshot matrix can verify it without scrolling past the
 * tab strip and group header.
 */
export default function AdminGroupMobilePromptPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <AdminPreviewChrome
      current="receipts"
      title="Lagos Rent Q2"
      crumbs="Administration / Lagos Rent Q2"
    >
      <main id="main-content" className="flex flex-col gap-4">
        <MobileReadonlyPrompt
          tabLabel="Settings"
          reason="Editing pool meta and WhatsApp wiring is a desktop task. Triage stays available on mobile."
        />
      </main>
    </AdminPreviewChrome>
  );
}
