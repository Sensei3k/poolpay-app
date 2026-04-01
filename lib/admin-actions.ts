'use server';

import { revalidatePath } from 'next/cache';
import { apiAction } from '@/lib/http';
import { ADMIN_TOKEN } from '@/lib/config';
import type { ActionResult, CycleStatus, GroupStatus, MemberStatus } from '@/lib/types';

async function adminAction(
  path: string,
  method: string,
  body?: unknown,
): Promise<ActionResult> {
  const result = await apiAction(path, { method, body, token: ADMIN_TOKEN });
  if (result.success) {
    revalidatePath('/');
    revalidatePath('/admin');
  }
  return result;
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function createGroup(input: {
  name: string;
  description?: string;
}): Promise<ActionResult> {
  return adminAction('/api/admin/groups', 'POST', input);
}

export async function updateGroup(
  id: string,
  input: { name?: string; status?: GroupStatus; description?: string },
): Promise<ActionResult> {
  return adminAction(`/api/admin/groups/${id}`, 'PATCH', input);
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  return adminAction(`/api/admin/groups/${id}`, 'DELETE');
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function createMember(
  groupId: string,
  input: { name: string; phone: string; position: number },
): Promise<ActionResult> {
  return adminAction(`/api/admin/groups/${groupId}/members`, 'POST', input);
}

export async function updateMember(
  id: string,
  input: { name?: string; phone?: string; position?: number; status?: MemberStatus },
): Promise<ActionResult> {
  return adminAction(`/api/admin/members/${id}`, 'PATCH', input);
}

export async function deleteMember(id: string): Promise<ActionResult> {
  return adminAction(`/api/admin/members/${id}`, 'DELETE');
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
  return adminAction(`/api/admin/groups/${groupId}/cycles`, 'POST', input);
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
  return adminAction(`/api/admin/cycles/${id}`, 'PATCH', input);
}

export async function deleteCycle(id: string): Promise<ActionResult> {
  return adminAction(`/api/admin/cycles/${id}`, 'DELETE');
}
