'use client';

import { ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { useAddAdminModalStore } from '@/lib/stores/add-admin-modal';

/**
 * Super-admin admins-list empty state (handoff `EmptyAdmins` artboard).
 * Surfaced by `<SysAdminsView>` when the rows array is empty. The
 * primary action opens the same Add-admin modal as the page-header
 * trigger, so super-admins can complete the create-then-grant flow
 * without scrolling for the trigger button.
 */
export function EmptyAdmins() {
  const openModal = useAddAdminModalStore((s) => s.openModal);

  return (
    <EmptyState
      ariaLabel="No admins yet"
      tone="dashed"
      headingLevel="h3"
      icon={<ShieldCheck size={28} />}
      title="No admins yet."
      description="Admins handle receipt confirmation for the groups you grant them. Create one to get started. They'll receive temporary credentials you can pass on."
      primaryAction={
        <button
          type="button"
          onClick={openModal}
          className="rounded-[10px] bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-surface-page"
        >
          Add first admin
        </button>
      }
    />
  );
}
