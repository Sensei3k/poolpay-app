/**
 * Client-orchestrated create-then-grant flow.
 *
 * Background (HANDOFF §5.4): the design contract is atomic, "create the
 * User account + create one or more `AdminGrant` rows in a single
 * step." poolpay-api does NOT yet expose a single endpoint for this,
 * BE-9 follow-up will add a transactional create-with-grants
 * endpoint. Until then, the frontend orchestrates a sequence of
 * existing endpoints and runs a best-effort compensation when any
 * grant step fails so the operator does not end up with an admin row
 * that has no scope.
 *
 * Sequence:
 *   1. POST /api/admin/users              → returns { userId }
 *   2. For each groupId G:
 *        POST /api/admin/users/{userId}/groups/{G}
 *   3. On any grant failure:
 *        DELETE /api/admin/users/{userId} (best-effort compensation)
 *
 * Compensation caveat: the DELETE soft-deletes; if it itself fails the
 * operator is left with a created-but-unscoped admin in the audit log.
 * That's an acceptable failure mode because:
 *   - The user cannot sign in to any group (no grants).
 *   - Audit retains the trail for follow-up.
 *   - The next BE-9 PR replaces this dance with a real transaction.
 *
 * This module is the orchestration logic ONLY, it accepts injected
 * "single-call" functions and returns a typed result. The Server
 * Action in `app/(app)/sys/admins/actions.ts` wires the real
 * `secureAction` calls in. Splitting them lets us unit-test the
 * compensation logic without spinning up a real HTTP stack.
 */

/** Outcome surfaced to the UI. */
export type CreateThenGrantResult =
  | {
      ok: true;
      userId: string;
      /** Pool ids that received a grant successfully. */
      grantedGroupIds: ReadonlyArray<string>;
    }
  | {
      ok: false;
      stage: 'create' | 'grant';
      error: string;
      /**
       * When `stage === 'grant'`, this is the userId the partial
       * create produced and the compensation attempt's result. The UI
       * surfaces this so the operator can decide whether to retry or
       * call ops.
       */
      partial?: {
        userId: string;
        compensated: boolean;
      };
    };

export interface CreateUserOutcome {
  ok: boolean;
  userId?: string;
  error?: string;
}

export interface GrantOutcome {
  ok: boolean;
  error?: string;
}

export interface CompensationOutcome {
  ok: boolean;
}

/** Injected single-call adapters, production hands in secureAction-backed implementations; tests pass fakes. */
export interface CreateThenGrantDeps {
  createUser: (input: {
    name: string;
    email: string;
    phone: string;
    initialPassword: string;
  }) => Promise<CreateUserOutcome>;
  grantGroup: (userId: string, groupId: string) => Promise<GrantOutcome>;
  deleteUser: (userId: string) => Promise<CompensationOutcome>;
}

export interface CreateThenGrantInput {
  name: string;
  email: string;
  phone: string;
  initialPassword: string;
  groupIds: ReadonlyArray<string>;
}

/**
 * Run the create-then-grant sequence with the supplied dependencies.
 *
 * Returns `ok: true` only when the user was created AND every requested
 * grant succeeded. A single grant failure aborts the loop and triggers
 * compensation.
 */
export async function runCreateThenGrant(
  input: CreateThenGrantInput,
  deps: CreateThenGrantDeps,
): Promise<CreateThenGrantResult> {
  const createOutcome = await deps.createUser({
    name: input.name,
    email: input.email,
    phone: input.phone,
    initialPassword: input.initialPassword,
  });
  if (!createOutcome.ok || !createOutcome.userId) {
    return {
      ok: false,
      stage: 'create',
      error: createOutcome.error ?? 'create_failed',
    };
  }

  const userId = createOutcome.userId;
  const granted: string[] = [];

  for (const groupId of input.groupIds) {
    const grantOutcome = await deps.grantGroup(userId, groupId);
    if (!grantOutcome.ok) {
      // Best-effort compensation. We do not await/retry; one shot is
      // the documented contract and any compounding failure here is
      // for incident review, not in-band reflection.
      const compensation = await deps.deleteUser(userId).catch(() => ({ ok: false }));
      return {
        ok: false,
        stage: 'grant',
        error: grantOutcome.error ?? 'grant_failed',
        partial: { userId, compensated: compensation.ok },
      };
    }
    granted.push(groupId);
  }

  return { ok: true, userId, grantedGroupIds: granted };
}
