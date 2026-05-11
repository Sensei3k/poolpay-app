'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { ModalStartCycle } from '@/components/admin/modal-start-cycle';

export default function StartCyclePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-d2-warm-bg">
      <ModalStartCycle
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        poolName="Lagos Rent Q2"
        cycleNumber={11}
        contributionLabel="₦ 12,000"
        dueDateLabel="Mon 28 Apr 2026"
        recipient={{
          name: 'Moyo Ibrahim',
          initial: 'M',
          positionLabel: 'position 11 of 12 · last received: never',
          swatch: 'oklch(0.76 0.08 310)',
        }}
        outstandingCount={1}
      />
    </div>
  );
}
