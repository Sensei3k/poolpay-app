'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import {
  ModalCreatePool,
  type ModalCreatePoolValues,
} from '@/components/super/modal-create-pool';

const INITIAL: ModalCreatePoolValues = {
  name: 'Lagos Rent Q3',
  currency: 'NGN',
  cadence: 'Weekly',
  contribution: '₦ 12,000',
  cycles: '12',
  startDate: 'Mon 5 May 2026',
  whatsappLink: '',
};

export default function CreatePoolPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [open, setOpen] = useState(true);
  const [values, setValues] = useState<ModalCreatePoolValues>(INITIAL);

  return (
    <div className="min-h-screen bg-d2-warm-bg">
      <ModalCreatePool
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        values={values}
        onChange={setValues}
      />
    </div>
  );
}
