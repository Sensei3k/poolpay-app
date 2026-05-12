'use server';

import { revalidatePath } from 'next/cache';
import { secureAction } from '@/lib/auth/backend-fetch';
import type { ActionResult, CycleStatus, GroupStatus, MemberStatus } from '@/lib/types';

/**
 * Admin CRUD wrapper around `secureAction`.
 *
 * Previously this module called a bespoke `apiAction(path, { token: ADMIN_TOKEN })`
 * helper that did a plain fetch with no auth-refresh flow. Migrating to
 * `secureAction` brings admin mutations onto the same single-401-retry +
 * `BackendUnauthorizedError` plumbing every other authenticated mutation
 * already uses (post-PR #68 graphify analysis, confidence 0.80).
 *
 * Public function signatures are preserved: each exported action still
 * resolves to `ActionResult` (`{ success: true } | { success: false; error }`)
 * so consumers in `app/(app)/admin/_components/*` need no change. Auth
 * failures continue to bubble as `BackendUnauthorizedError` for the caller's
 * /signin redirect, matching `lib/actions/receipts.ts`.
 */
async function runAdminMutation(
  path: string,
  method: string,
  body?: unknown,
): Promise<ActionResult> {
  const result = await secureAction(path, { method, body });
  if (result.success) {
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  }
  return { success: false, error: result.error };
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function createGroup(input: {
  name: string;
  description?: string;
}): Promise<ActionResult> {
  return runAdminMutation('/api/admin/groups', 'POST', input);
}

export async function updateGroup(
  id: string,
  input: { name?: string; status?: GroupStatus; description?: string },
): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/groups/${id}`, 'PATCH', input);
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/groups/${id}`, 'DELETE');
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function createMember(
  groupId: string,
  input: { name: string; phone: string; position: number },
): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/groups/${groupId}/members`, 'POST', input);
}

export async function updateMember(
  id: string,
  input: { name?: string; phone?: string; position?: number; status?: MemberStatus },
): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/members/${id}`, 'PATCH', input);
}

export async function deleteMember(id: string): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/members/${id}`, 'DELETE');
}

// ─── Cycles ───────────────────────────────────────────────────────────────────

export async function createCycle(
  groupId: string,
  input: {
    cycleNumber: number;
    startDate: string;
    endDate: string;
    contributionPerMember: number;
    recipientMemberId: string;
  },
): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/groups/${groupId}/cycles`, 'POST', input);
}

export async function updateCycle(
  id: string,
  input: {
    startDate?: string;
    endDate?: string;
    contributionPerMember?: number;
    recipientMemberId?: string;
    status?: CycleStatus;
  },
): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/cycles/${id}`, 'PATCH', input);
}

export async function deleteCycle(id: string): Promise<ActionResult> {
  return runAdminMutation(`/api/admin/cycles/${id}`, 'DELETE');
}
