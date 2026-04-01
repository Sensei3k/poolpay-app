'use server';

import { revalidatePath } from 'next/cache';
import { BACKEND_URL, ADMIN_TOKEN } from '@/lib/config';
import type { ActionResult, CycleStatus, GroupStatus, MemberStatus } from '@/lib/types';

const BASE = BACKEND_URL;

async function adminFetch(url: string, method: string, body?: unknown): Promise<ActionResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = (data as { error?: string }).error ?? `${res.status} ${res.statusText}`;
      return { success: false, error: message };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function createGroup(input: {
  name: string;
  description?: string;
}): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/groups`, 'POST', input);
}

export async function updateGroup(
  id: string,
  input: { name?: string; status?: GroupStatus; description?: string },
): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/groups/${id}`, 'PATCH', input);
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/groups/${id}`, 'DELETE');
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function createMember(
  groupId: string,
  input: { name: string; phone: string; position: number },
): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/groups/${groupId}/members`, 'POST', input);
}

export async function updateMember(
  id: string,
  input: { name?: string; phone?: string; position?: number; status?: MemberStatus },
): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/members/${id}`, 'PATCH', input);
}

export async function deleteMember(id: string): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/members/${id}`, 'DELETE');
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
  return adminFetch(`${BASE}/api/admin/groups/${groupId}/cycles`, 'POST', input);
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
  return adminFetch(`${BASE}/api/admin/cycles/${id}`, 'PATCH', input);
}

export async function deleteCycle(id: string): Promise<ActionResult> {
  return adminFetch(`${BASE}/api/admin/cycles/${id}`, 'DELETE');
}
