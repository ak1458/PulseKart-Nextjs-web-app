import { query, transaction } from './db';
import { summariseShift, reconcileShift, type ShiftSale, type ShiftSummary } from '@/domain/shift';
import type { SessionUser } from './auth';

/**
 * Register shifts.
 *
 * A shift is the unit of cash accountability. Nothing may be sold outside one,
 * because a sale with no shift cannot be reconciled against a drawer.
 */

export interface Shift {
    id: string;
    outletId: string;
    outletName: string;
    openedBy: string;
    openedByName: string;
    openedAt: string;
    openingFloat: number;
    status: 'open' | 'closed';
}

export class NoOpenShiftError extends Error {
    constructor() {
        super('Open a shift before selling.');
        this.name = 'NoOpenShiftError';
    }
}

export class ShiftAlreadyOpenError extends Error {
    constructor() {
        super('This counter already has an open shift.');
        this.name = 'ShiftAlreadyOpenError';
    }
}

export async function getOpenShift(outletId: string): Promise<Shift | null> {
    const rows = await query<Record<string, unknown>>(
        `SELECT s.id, s.outlet_id, s.opened_by, s.opened_at, s.opening_float,
                s.status, o.name AS outlet_name, u.name AS opened_by_name
           FROM shifts s
           JOIN outlets o ON o.id = s.outlet_id
           JOIN users u   ON u.id = s.opened_by
          WHERE s.outlet_id = $1 AND s.status = 'open'
          LIMIT 1`,
        [outletId],
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: String(row.id),
        outletId: String(row.outlet_id),
        outletName: String(row.outlet_name),
        openedBy: String(row.opened_by),
        openedByName: String(row.opened_by_name),
        openedAt: new Date(row.opened_at as string).toISOString(),
        openingFloat: Number(row.opening_float),
        status: 'open',
    };
}

/**
 * Open a shift.
 *
 * The database enforces one open shift per outlet with a partial unique index,
 * so a race between two tills fails on the constraint rather than producing two
 * drawers nobody can reconcile. That error is translated into a clear message
 * rather than surfacing a Postgres constraint name.
 */
export async function openShift(
    user: SessionUser,
    outletId: string,
    openingFloat: number,
): Promise<Shift> {
    if (!Number.isFinite(openingFloat) || openingFloat < 0) {
        throw new RangeError('Opening float cannot be negative.');
    }

    try {
        const rows = await query<{ id: string }>(
            `INSERT INTO shifts (pharmacy_id, outlet_id, opened_by, opening_float)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [user.pharmacyId, outletId, user.id, openingFloat],
        );

        const shift = await getOpenShift(outletId);
        if (!shift) throw new Error(`Shift ${rows[0].id} vanished after insert`);
        return shift;
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            (error as { code: string }).code === '23505'
        ) {
            throw new ShiftAlreadyOpenError();
        }
        throw error;
    }
}

/** Takings for a shift, computed from its sales. */
export async function getShiftSummary(shiftId: string): Promise<ShiftSummary> {
    const rows = await query<{ total: string; payment_mode: string; status: string }>(
        `SELECT total, payment_mode, status FROM sales WHERE shift_id = $1`,
        [shiftId],
    );

    const floatRows = await query<{ opening_float: string }>(
        `SELECT opening_float FROM shifts WHERE id = $1`,
        [shiftId],
    );

    const sales: ShiftSale[] = rows.map((row) => ({
        total: Number(row.total),
        paymentMode: row.payment_mode as ShiftSale['paymentMode'],
        status: row.status as ShiftSale['status'],
    }));

    return summariseShift(sales, Number(floatRows[0]?.opening_float ?? 0));
}

export interface ShiftClosureResult {
    summary: ShiftSummary;
    expectedCash: number;
    countedCash: number;
    variance: number;
}

/**
 * Close a shift against a counted drawer.
 *
 * The expected figure is recomputed here rather than trusted from the client,
 * and both it and the variance are stored — so a later correction to a sale
 * cannot silently rewrite what the drawer was reconciled against on the night.
 */
export async function closeShift(
    user: SessionUser,
    shiftId: string,
    countedCash: number,
    note?: string,
): Promise<ShiftClosureResult> {
    if (!Number.isFinite(countedCash) || countedCash < 0) {
        throw new RangeError('Counted cash cannot be negative.');
    }

    const summary = await getShiftSummary(shiftId);
    const closure = reconcileShift(summary.expectedCash, countedCash);

    return transaction(async (client) => {
        const result = await client.query(
            `UPDATE shifts
                SET status = 'closed',
                    closed_by = $2,
                    closed_at = NOW(),
                    closing_counted = $3,
                    closing_expected = $4,
                    variance = $5,
                    close_note = $6
              WHERE id = $1 AND status = 'open'`,
            [
                shiftId,
                user.id,
                closure.countedCash,
                closure.expectedCash,
                closure.variance,
                note ?? null,
            ],
        );

        if (result.rowCount === 0) {
            throw new Error('That shift is not open.');
        }

        return {
            summary,
            expectedCash: closure.expectedCash,
            countedCash: closure.countedCash,
            variance: closure.variance,
        };
    });
}
