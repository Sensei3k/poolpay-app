import { notFound } from 'next/navigation';
import { Banner } from '@/components/feedback/banner';
import { Toast } from '@/components/feedback/toast';
import { MemberPreviewChrome } from '../../member/_chrome';

/**
 * Dev-only preview of the feedback `<Toast>` + `<Banner>` primitives.
 * Mirrors the handoff `ToastsScene` artboard so the screenshot pass has
 * a single page to capture in light + dark. Production builds 404 this
 * route via the standard preview gate.
 */
export default function ToastsBannersPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <MemberPreviewChrome
      current="home"
      title="Toasts & banners"
      sub="Patterns shown together for handoff reference"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section>
          <div className="kicker-mono mb-2.5 text-[10px]">
            Toast · transient · 5s
          </div>
          <div className="flex flex-col gap-2.5">
            <Toast
              tone="success"
              title="Receipt confirmed"
              description="Tola B. · ₦ 12,000 · cycle 10"
              onDismiss={() => undefined}
            />
            <Toast
              tone="info"
              title="Cycle 11 starts in 3 days"
              description="Notify members? Send reminder."
              onDismiss={() => undefined}
            />
            <Toast
              tone="warning"
              title="1 receipt is older than 48h"
              description="Old receipts may be duplicates"
              onDismiss={() => undefined}
            />
            <Toast
              tone="error"
              title="Could not save settings"
              description="Network error, retry available"
              onDismiss={() => undefined}
            />
          </div>
        </section>
        <section className="flex flex-col gap-5">
          <div>
            <div className="kicker-mono mb-2.5 text-[10px]">
              Banner · persistent
            </div>
            <div className="flex flex-col gap-2.5">
              <Banner
                tone="sparkle"
                title="Add a payout method"
                body="You haven't set up a bank account yet. Required before your cycle 13 payout."
                actions={
                  <>
                    <button
                      type="button"
                      className="rounded-md bg-d2-ink px-2.5 py-1 text-[11.5px] font-semibold text-d2-warm-bg"
                    >
                      Set up now
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-transparent px-2.5 py-1 text-[11.5px] font-medium text-d2-ink/60"
                    >
                      Remind me later
                    </button>
                  </>
                }
              />
              <Banner
                tone="error"
                body={
                  <>
                    <strong className="text-d2-ink">Pool paused.</strong> 3
                    members are &gt;7 days overdue. The admin must resolve
                    before the next cycle starts.
                  </>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </MemberPreviewChrome>
  );
}
