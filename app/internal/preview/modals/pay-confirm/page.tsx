'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { ModalPayConfirm } from '@/components/member/modal-pay-confirm';

/**
 * Dev-only preview of the pay-confirm modal. Mounts the modal pre-open
 * against a stable fixture so the screenshot pass captures the
 * artboard. Production builds 404 this route.
 */
export default function PayConfirmPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [open, setOpen] = useState(true);
  const [notify, setNotify] = useState(true);

  return (
    <div className="min-h-screen bg-d2-warm-bg">
      <ModalPayConfirm
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        poolName="Lagos Rent Q2"
        amountLabel="₦ 12,000"
        cycleLabel="cycle 10"
        whenLabel="week of 22 Apr"
        recipientName="Adaeze Okonkwo · GTBank"
        recipientAccount="0143 ••• 8821"
        memo="LRQ2 · w10 · Tola"
        notifyWhatsApp={notify}
        onToggleNotify={() => setNotify((n) => !n)}
      />
    </div>
  );
}
