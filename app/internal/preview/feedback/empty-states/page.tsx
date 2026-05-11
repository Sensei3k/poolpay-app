import { notFound } from 'next/navigation';
import { EmptyInbox } from '@/components/member/empty-inbox';
import { EmptyPools } from '@/components/member/empty-pools';
import { EmptyAdmins } from '@/components/super/empty-admins';
import { MemberPreviewChrome } from '../../member/_chrome';

/**
 * Dev-only preview of the three empty-state artboards (EmptyPools,
 * EmptyInbox, EmptyAdmins). All three rendered side-by-side so the
 * screenshot pass can capture the trio in one frame. Production builds
 * 404 this route via the standard preview gate.
 */
export default function EmptyStatesPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <MemberPreviewChrome
      current="home"
      title="Empty states"
      sub="EmptyPools · EmptyInbox · EmptyAdmins"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section>
          <div className="kicker-mono mb-3 text-[10px]">EmptyPools</div>
          <EmptyPools />
        </section>
        <section>
          <div className="kicker-mono mb-3 text-[10px]">EmptyInbox</div>
          <EmptyInbox />
        </section>
        <section>
          <div className="kicker-mono mb-3 text-[10px]">EmptyAdmins</div>
          <EmptyAdmins />
        </section>
      </div>
    </MemberPreviewChrome>
  );
}
