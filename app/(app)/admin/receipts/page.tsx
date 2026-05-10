import { Separator } from '@/components/ui/separator';

/**
 * Slice-1 stub for `/admin/receipts` — the admin receipts queue.
 *
 * The sidebar's "Receipts queue" entry (admin / super_admin only)
 * routes here, and `pp-shell-route` already maps the path to the
 * `receipts` sidebar id with crumbs "Administration". Without this
 * page the link would 404 in slice 1.
 *
 * Slice 5 replaces this stub with the real queue UI (live pending
 * count, approve / reject affordances, evidence preview, etc.) and
 * also wires the `pendingReceiptsCount` badge in the sidebar to the
 * receipts-queue Zustand store.
 */
export default function AdminReceiptsPage() {
  return (
    <main id="main-content" aria-label="Admin receipts queue">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tighter text-foreground">
          Receipts queue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pending payment receipts awaiting admin review.
        </p>
        <Separator className="mt-6 bg-border" />
      </div>

      <div
        role="status"
        className="rounded-lg border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground"
      >
        The receipts queue lands in slice 5. This stub keeps the
        sidebar link routable so slice 1 can capture the active state.
      </div>
    </main>
  );
}
