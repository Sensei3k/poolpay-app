'use client';

import { Plus } from 'lucide-react';
import { useAddAdminModalStore } from '@/lib/stores/add-admin-modal';

/**
 * Toolbar trigger for the add-admin modal. Lives next to the
 * `<ModalAddAdmin>` in `<SysAdminsView>`.
 *
 * Note: the modal mounts unconditionally and returns `null` when closed
 * (see `ModalAddAdmin`). Splitting the trigger from the modal body keeps
 * the modal's "use client" hooks (refs, focus traps, Zustand selectors)
 * isolated to the modal subtree so the page-level RSC stays minimal, but
 * it does NOT defer the modal's mount until first open.
 */
export function AddAdminTrigger() {
  const openModal = useAddAdminModalStore((s) => s.openModal);

  return (
    <button
      type="button"
      onClick={openModal}
      className="inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium"
      style={{ background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)' }}
    >
      <Plus size={13} aria-hidden="true" />
      Add admin
    </button>
  );
}
