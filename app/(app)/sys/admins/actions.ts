'use server';

import { revalidatePath } from 'next/cache';
import {
  BackendUnauthorizedError,
  secureAction,
} from '@/lib/auth/backend-fetch';
import {
  runCreateThenGrant,
  type CreateThenGrantResult,
} from '@/lib/super-admin/create-then-grant';

/**
 * Server Action input from the add-admin modal. `initialPassword` is
 * generated client-side via `generateTempPassword` (Web Crypto) and
 * passed through here verbatim. The server never echoes it back in
 * the response, so the modal must hold onto the value it generated.
 */
export interface CreateAdminInput {
  /**
   * @deprecated Captured in the modal for operator handoff convenience
   * (so the operator can verbalise who they just created). The current
   * `POST /api/admin/users` body does not accept `name`. BE-9 will widen
   * the contract; until then this field is silently dropped by the
   * createUser adapter below.
   */
  name: string;
  email: string;
  /**
   * @deprecated Captured for the same operator-handoff reason as `name`.
   * Same BE-9 wider-contract follow-up applies; dropped on the way out.
   */
  phone: string;
  initialPassword: string;
  groupIds: ReadonlyArray<string>;
}

/**
 * Server-side response shape from `POST /api/admin/users`, only the
 * fields the orchestrator needs. The wider response is documented in
 * poolpay-api's `AdminUserResponse`.
 */
interface CreateUserResponse {
  userId: string;
}

/**
 * Server Action wrapper around the client-orchestrated create-then-grant
 * sequence. Each step routes through `secureAction` so failed-401
 * refresh-retries are honored uniformly.
 *
 * Why a Server Action and not a Route Handler:
 *  - `secureAction` is server-only and refreshes the auth cookie when a
 *    401 triggers a refresh. Route Handlers carry the same primitives,
 *    but the modal's client component already uses `react-hook-form` +
 *    `useFormStatus`, which is the canonical Server Actions pattern in
 *    this repo (slice 1 / FE-6).
 *
 * Atomic-transaction follow-up: BE-9 will land
 * `POST /api/admin/users/with-grants` and this wrapper becomes a single
 * call. The orchestrator stays for any operator who pre-dates that
 * shipping.
 */
export async function createAdminAction(
  input: CreateAdminInput,
): Promise<CreateThenGrantResult> {
  try {
    const result = await runCreateThenGrant(input, {
      createUser: async ({ email, initialPassword }) => {
        // The poolpay-api `POST /api/admin/users` body only takes
        // `email`, `initialPassword`, `role`. `name` and `phone` are
        // captured in the modal for operator handoff convenience but
        // there is no FE-facing endpoint to persist them yet; BE-9
        // will widen the body. For now we accept the wider modal
        // input and drop the unused fields here, in one place.
        const r = await secureAction<CreateUserResponse>('/api/admin/users', {
          body: { email, initialPassword, role: 'admin' },
        });
        if (r.success) {
          return { ok: true, userId: r.data?.userId };
        }
        return { ok: false, error: r.error };
      },
      grantGroup: async (userId, groupId) => {
        const r = await secureAction<unknown>(
          `/api/admin/users/${userId}/groups/${groupId}`,
        );
        if (r.success) return { ok: true };
        return { ok: false, error: r.error };
      },
      deleteUser: async (userId) => {
        const r = await secureAction<unknown>(
          `/api/admin/users/${userId}`,
          { method: 'DELETE' },
        );
        return { ok: r.success };
      },
    });

    if (result.ok) {
      // Refresh the admins listing once the chain succeeds. The /sys
      // listing pages still render from `lib/data.ts` mocks until the
      // BE list endpoints land (slice 4 deviation #2), so this is
      // currently a no-op for the visible list, but it makes the page
      // re-render path correct for the day those endpoints exist.
      revalidatePath('/sys/admins');
    }
    return result;
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) throw err;
    return {
      ok: false,
      stage: 'create',
      error: err instanceof Error ? err.message : 'unexpected_error',
    };
  }
}
