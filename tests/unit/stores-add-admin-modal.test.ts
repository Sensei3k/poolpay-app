import { beforeEach, describe, expect, it } from 'vitest';
import { useAddAdminModalStore } from '@/lib/stores/add-admin-modal';

describe('useAddAdminModalStore', () => {
  beforeEach(() => {
    useAddAdminModalStore.getState().reset();
  });

  it('starts closed in the form step with no creds revealed', () => {
    const state = useAddAdminModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.step).toBe('form');
    expect(state.revealed).toBeNull();
    expect(state.acknowledgedReveal).toBe(false);
    expect(state.form.selectedGroupIds.size).toBe(0);
  });

  it('opens cleanly even after a prior session leaves a temp password behind', () => {
    const { reveal, openModal } = useAddAdminModalStore.getState();
    reveal({
      email: 'old@example.com',
      tempPassword: 'leaked-from-prior-session',
      grantedGroupNames: ['Pool A'],
    });
    openModal();
    const state = useAddAdminModalStore.getState();
    expect(state.open).toBe(true);
    expect(state.revealed).toBeNull();
    expect(state.step).toBe('form');
  });

  it('toggles group selections idempotently', () => {
    const { toggleGroup } = useAddAdminModalStore.getState();
    toggleGroup('pool-a');
    toggleGroup('pool-b');
    expect(useAddAdminModalStore.getState().form.selectedGroupIds.has('pool-a')).toBe(true);
    expect(useAddAdminModalStore.getState().form.selectedGroupIds.has('pool-b')).toBe(true);

    toggleGroup('pool-a');
    expect(useAddAdminModalStore.getState().form.selectedGroupIds.has('pool-a')).toBe(false);
  });

  it('transitions form → submitting → revealed on a happy path', () => {
    const { beginSubmit, reveal } = useAddAdminModalStore.getState();
    beginSubmit();
    expect(useAddAdminModalStore.getState().step).toBe('submitting');
    reveal({ email: 'a@b.c', tempPassword: 'pw', grantedGroupNames: ['Pool A'] });
    const state = useAddAdminModalStore.getState();
    expect(state.step).toBe('revealed');
    expect(state.revealed?.tempPassword).toBe('pw');
  });

  it('moves to error state on fail and clears revealed creds', () => {
    const { beginSubmit, reveal, fail } = useAddAdminModalStore.getState();
    beginSubmit();
    reveal({ email: 'a@b.c', tempPassword: 'pw', grantedGroupNames: [] });
    fail('duplicate email');
    const state = useAddAdminModalStore.getState();
    expect(state.step).toBe('error');
    expect(state.errorMessage).toBe('duplicate email');
    expect(state.revealed).toBeNull();
  });

  it('closeModal clears the temp password and resets the form', () => {
    const { reveal, closeModal } = useAddAdminModalStore.getState();
    reveal({ email: 'a@b.c', tempPassword: 'must-not-linger', grantedGroupNames: [] });
    closeModal();
    const state = useAddAdminModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.step).toBe('form');
    expect(state.revealed).toBeNull();
    expect(state.acknowledgedReveal).toBe(false);
  });

  it('acknowledgement unlocks dismissal', () => {
    const { reveal, acknowledge } = useAddAdminModalStore.getState();
    reveal({ email: 'a@b.c', tempPassword: 'pw', grantedGroupNames: [] });
    expect(useAddAdminModalStore.getState().acknowledgedReveal).toBe(false);
    acknowledge();
    expect(useAddAdminModalStore.getState().acknowledgedReveal).toBe(true);
  });

  it('setForm merges partial updates without dropping unrelated fields', () => {
    const { setForm } = useAddAdminModalStore.getState();
    setForm({ name: 'Chidi Obi' });
    setForm({ email: 'chidi@chamasave.ng' });
    const state = useAddAdminModalStore.getState();
    expect(state.form.name).toBe('Chidi Obi');
    expect(state.form.email).toBe('chidi@chamasave.ng');
  });
});
