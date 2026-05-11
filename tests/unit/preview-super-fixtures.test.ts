import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREVIEW_SUPER_POOL_ID,
  getSystemAdminsFixture,
  getSystemGroupDetailFixture,
  getSystemGroupsFixture,
  getSystemReceiptsFixture,
  getSystemWhatsAppFixture,
} from '@/lib/preview/super-fixtures';

describe('super-fixtures', () => {
  it('returns a non-empty system receipts queue', () => {
    const f = getSystemReceiptsFixture();
    expect(f.rows.length).toBeGreaterThan(0);
    expect(f.aggregates.pending).toBeGreaterThan(0);
    // The "no-admin" alarm flag is what super-admin actions act on —
    // make sure the fixture surfaces at least one such row.
    expect(f.rows.some((r) => r.flag === 'no-admin')).toBe(true);
  });

  it('marks the unassigned-admin row with the destructive tone', () => {
    const f = getSystemReceiptsFixture();
    const orphan = f.rows.find((r) => r.flag === 'no-admin');
    expect(orphan?.tone).toBe('out');
    expect(orphan?.adminName).toBeNull();
  });

  it('returns groups with at least one orphan and one healthy tone', () => {
    const f = getSystemGroupsFixture();
    expect(f.rows.length).toBeGreaterThan(0);
    expect(f.rows.some((r) => r.tone === 'orphan')).toBe(true);
    expect(f.rows.some((r) => r.tone === 'paid')).toBe(true);
  });

  it('returns null group detail for an unknown poolId', () => {
    expect(getSystemGroupDetailFixture('nope-pool-id')).toBeNull();
  });

  it('returns a populated group detail for the default preview pool', () => {
    const detail = getSystemGroupDetailFixture(DEFAULT_PREVIEW_SUPER_POOL_ID);
    expect(detail).not.toBeNull();
    expect(detail?.record.length).toBeGreaterThan(0);
    expect(detail?.audit.length).toBeGreaterThan(0);
  });

  it('returns admins with cross-summed grant totals', () => {
    const f = getSystemAdminsFixture();
    expect(f.rows.length).toBeGreaterThan(0);
    const summed = f.rows.reduce((acc, r) => acc + r.grantCount, 0);
    expect(f.aggregates.totalGrants).toBe(summed);
  });

  it('exposes group options the modal can render as grant chips', () => {
    const f = getSystemAdminsFixture();
    expect(f.groupOptions.length).toBeGreaterThan(0);
    for (const opt of f.groupOptions) {
      expect(opt.poolId).toBeTruthy();
      expect(opt.poolName).toBeTruthy();
    }
  });

  it('returns whatsapp rows with both healthy and unlinked statuses', () => {
    const f = getSystemWhatsAppFixture();
    expect(f.rows.length).toBeGreaterThan(0);
    expect(f.rows.some((r) => r.status === 'healthy')).toBe(true);
    expect(f.rows.some((r) => r.status === 'unlinked')).toBe(true);
    expect(f.rows.some((r) => r.status === 'drift')).toBe(true);
  });

  it('sets hasDrift=true on rows where matched < members', () => {
    const f = getSystemWhatsAppFixture();
    const drift = f.rows.find((r) => r.status === 'drift');
    expect(drift?.hasDrift).toBe(true);
  });
});
