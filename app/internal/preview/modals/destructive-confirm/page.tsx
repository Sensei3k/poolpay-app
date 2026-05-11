'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { ModalDestructiveConfirm } from '@/components/admin/modal-destructive-confirm';

export default function DestructiveConfirmPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-d2-warm-bg">
      <ModalDestructiveConfirm
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Remove Tola from Lagos Rent Q2?"
        sub="They have ₦ 24,000 outstanding across 2 cycles. Removing them won't refund, settle their balance first."
        reassurance="Tola will lose access to the pool. Their past contributions stay on the cycle log for audit."
      />
    </div>
  );
}
