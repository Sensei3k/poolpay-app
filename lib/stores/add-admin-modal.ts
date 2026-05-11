/**
 * Add-admin modal state — super-admin create-then-grant flow.
 *
 * The modal walks through three steps:
 *  1. `form`     — capture name/email/phone + the group-grant chip set
 *  2. `submitting` — server action in flight (create + grant chain)
 *  3. `revealed` — show the temp credentials ONCE; user must explicitly close
 *
 * Why this lives in Zustand rather than `useState`:
 *  - The dismissal lock survives the modal subtree: when the temp creds
 *    are visible, the close button is gated behind an explicit
 *    "I've copied them" acknowledgement so an accidental backdrop click
 *    can't burn the operator's only chance to copy.
 *  - The store outlives the modal's render tree across the trigger
 *    button's hover / unmount cycles in `<SD_Admins>` (the trigger lives
 *    in the toolbar; the modal portals in / out).
 *  - Tests can drive the flow without rendering the React tree.
 *
 * Why this does NOT mirror server data:
 *  - The list of groups available for grant comes from the server via
 *    the parent RSC. The store only holds the SELECTED subset (a `Set`
 *    of poolIds), not the catalogue itself.
 *
 * Security: `tempPassword` is ephemeral. `reset()` clears it. The modal
 * also wires an unmount-cleanup that calls `reset()` so even if a caller
 * forgets to dismiss explicitly, the field zeroes out the moment the
 * modal unmounts. Never persisted to localStorage; never logged.
 */

import { create } from 'zustand';

/** UI step the modal is on right now. */
export type AddAdminStep = 'form' | 'submitting' | 'revealed' | 'error';

export interface AddAdminFormValues {
  name: string;
  email: string;
  phone: string;
  /** Selected pool ids the new admin should receive grants on. */
  selectedGroupIds: ReadonlySet<string>;
}

export interface RevealedCredentials {
  email: string;
  /** Plaintext password — visible ONCE; cleared on close. */
  tempPassword: string;
  /** Comma-joined pool names granted, for the confirmation summary. */
  grantedGroupNames: ReadonlyArray<string>;
}

interface AddAdminModalState {
  open: boolean;
  step: AddAdminStep;
  form: AddAdminFormValues;
  /**
   * Populated only when `step === 'revealed'`. Reading this when the
   * modal is closed (or in any other step) returns `null` so consumers
   * never receive stale credentials.
   */
  revealed: RevealedCredentials | null;
  /**
   * Operator must tick "I've copied the password" before the modal can
   * be dismissed. Prevents an accidental backdrop click from burning
   * the one-time reveal.
   */
  acknowledgedReveal: boolean;
  /** Last error string surfaced to the user (e.g. "duplicate email"). */
  errorMessage: string | null;

  openModal: () => void;
  closeModal: () => void;
  setForm: (patch: Partial<AddAdminFormValues>) => void;
  toggleGroup: (poolId: string) => void;
  beginSubmit: () => void;
  reveal: (creds: RevealedCredentials) => void;
  fail: (message: string) => void;
  acknowledge: () => void;
  reset: () => void;
}

function emptyForm(): AddAdminFormValues {
  return { name: '', email: '', phone: '', selectedGroupIds: new Set<string>() };
}

function initial(): Omit<
  AddAdminModalState,
  | 'openModal'
  | 'closeModal'
  | 'setForm'
  | 'toggleGroup'
  | 'beginSubmit'
  | 'reveal'
  | 'fail'
  | 'acknowledge'
  | 'reset'
> {
  return {
    open: false,
    step: 'form',
    form: emptyForm(),
    revealed: null,
    acknowledgedReveal: false,
    errorMessage: null,
  };
}

export const useAddAdminModalStore = create<AddAdminModalState>((set) => ({
  ...initial(),

  openModal: () => set({ ...initial(), open: true }),

  closeModal: () => {
    // Always clears the password — even if the operator dismisses
    // without acknowledging, the credential never lingers in memory.
    set(initial());
  },

  setForm: (patch) =>
    set((state) => ({
      form: { ...state.form, ...patch },
    })),

  toggleGroup: (poolId) =>
    set((state) => {
      const next = new Set(state.form.selectedGroupIds);
      if (next.has(poolId)) next.delete(poolId);
      else next.add(poolId);
      return { form: { ...state.form, selectedGroupIds: next } };
    }),

  beginSubmit: () => set({ step: 'submitting', errorMessage: null }),

  reveal: (creds) =>
    set({
      step: 'revealed',
      revealed: creds,
      acknowledgedReveal: false,
      errorMessage: null,
    }),

  fail: (message) =>
    set({
      step: 'error',
      errorMessage: message,
      revealed: null,
    }),

  acknowledge: () => set({ acknowledgedReveal: true }),

  reset: () => set(initial()),
}));
