/**
 * Register shift reconciliation.
 *
 * A shift is the unit of cash accountability: one person, one drawer, one
 * span of time. Closing it means comparing what the drawer physically holds
 * against what the system says it should hold, and recording the difference —
 * including when the difference is zero.
 */

import { round2 } from './gst';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'credit';

export interface ShiftSale {
    total: number;
    paymentMode: PaymentMode;
    status: 'completed' | 'voided';
}

export interface ShiftSummary {
    /** Completed sales only, by tender. */
    byMode: Record<PaymentMode, number>;
    /** All completed sales, any tender. */
    salesTotal: number;
    saleCount: number;
    voidedCount: number;
    /** Opening float + cash sales. What the drawer should physically hold. */
    expectedCash: number;
}

/**
 * Summarise a shift's takings.
 *
 * Only cash affects the drawer. Card and UPI settle to the bank, and credit has
 * not been collected at all — counting any of them as cash guarantees a
 * variance every single day and trains staff to ignore the number.
 *
 * Voided sales are counted but never contribute to takings.
 */
export function summariseShift(
    sales: ShiftSale[],
    openingFloat: number,
): ShiftSummary {
    const byMode: Record<PaymentMode, number> = {
        cash: 0, card: 0, upi: 0, credit: 0,
    };

    let salesTotal = 0;
    let saleCount = 0;
    let voidedCount = 0;

    for (const sale of sales) {
        if (sale.status === 'voided') {
            voidedCount += 1;
            continue;
        }
        byMode[sale.paymentMode] = round2(byMode[sale.paymentMode] + sale.total);
        salesTotal = round2(salesTotal + sale.total);
        saleCount += 1;
    }

    return {
        byMode,
        salesTotal,
        saleCount,
        voidedCount,
        expectedCash: round2(openingFloat + byMode.cash),
    };
}

export interface ShiftClosure {
    expectedCash: number;
    countedCash: number;
    /** counted - expected. Negative is a shortfall. */
    variance: number;
    isShort: boolean;
    isOver: boolean;
    isBalanced: boolean;
}

/**
 * Reconcile a counted drawer against expectations.
 *
 * The variance is reported exactly as counted. There is deliberately no
 * tolerance band that quietly swallows small differences: a persistent ₹5
 * shortfall is a signal, and rounding it away hides the thing the count exists
 * to surface.
 */
export function reconcileShift(
    expectedCash: number,
    countedCash: number,
): ShiftClosure {
    const variance = round2(countedCash - expectedCash);
    return {
        expectedCash: round2(expectedCash),
        countedCash: round2(countedCash),
        variance,
        isShort: variance < 0,
        isOver: variance > 0,
        isBalanced: variance === 0,
    };
}

/** Denominations of Indian currency a drawer is counted in. */
export const CASH_DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1] as const;

export type DenominationCount = Partial<Record<(typeof CASH_DENOMINATIONS)[number], number>>;

/**
 * Total a denomination-wise count.
 *
 * Counting by denomination rather than typing one number is what makes a close
 * auditable — and it catches the transposition errors that a single total hides.
 */
export function totalDenominations(counts: DenominationCount): number {
    return round2(
        CASH_DENOMINATIONS.reduce((sum, denom) => {
            const count = counts[denom] ?? 0;
            if (!Number.isFinite(count) || count < 0) return sum;
            return sum + denom * Math.floor(count);
        }, 0),
    );
}
