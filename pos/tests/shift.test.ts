import { describe, it, expect } from 'vitest';
import {
    summariseShift,
    reconcileShift,
    totalDenominations,
    type ShiftSale,
} from '../src/domain/shift';

const sale = (
    total: number,
    paymentMode: ShiftSale['paymentMode'] = 'cash',
    status: ShiftSale['status'] = 'completed',
): ShiftSale => ({ total, paymentMode, status });

describe('summariseShift', () => {
    it('counts only cash toward what the drawer should hold', () => {
        const summary = summariseShift(
            [sale(100, 'cash'), sale(500, 'card'), sale(250, 'upi')],
            1000,
        );

        // Card and UPI settle to the bank; they never enter the drawer.
        expect(summary.expectedCash).toBe(1100);
        expect(summary.salesTotal).toBe(850);
    });

    it('excludes credit sales from the drawer', () => {
        const summary = summariseShift([sale(300, 'credit')], 500);

        expect(summary.expectedCash).toBe(500);
        expect(summary.byMode.credit).toBe(300);
    });

    it('excludes voided sales from takings but still counts them', () => {
        const summary = summariseShift(
            [sale(100, 'cash'), sale(999, 'cash', 'voided')],
            0,
        );

        expect(summary.expectedCash).toBe(100);
        expect(summary.saleCount).toBe(1);
        expect(summary.voidedCount).toBe(1);
    });

    it('handles a shift with no sales', () => {
        const summary = summariseShift([], 2000);

        expect(summary.expectedCash).toBe(2000);
        expect(summary.salesTotal).toBe(0);
        expect(summary.saleCount).toBe(0);
    });

    it('does not accumulate floating point drift across many sales', () => {
        const sales = Array.from({ length: 100 }, () => sale(10.1, 'cash'));
        const summary = summariseShift(sales, 0);

        expect(summary.expectedCash).toBe(1010);
    });
});

describe('reconcileShift', () => {
    it('reports a balanced drawer', () => {
        const closure = reconcileShift(5000, 5000);

        expect(closure.isBalanced).toBe(true);
        expect(closure.variance).toBe(0);
    });

    it('reports a shortfall as a negative variance', () => {
        const closure = reconcileShift(5000, 4950);

        expect(closure.variance).toBe(-50);
        expect(closure.isShort).toBe(true);
        expect(closure.isOver).toBe(false);
    });

    it('reports an overage', () => {
        const closure = reconcileShift(5000, 5020);

        expect(closure.variance).toBe(20);
        expect(closure.isOver).toBe(true);
    });

    it('does not swallow a small difference into zero', () => {
        // No tolerance band: a persistent small shortfall is the signal.
        const closure = reconcileShift(5000, 4999.5);

        expect(closure.variance).toBe(-0.5);
        expect(closure.isBalanced).toBe(false);
    });
});

describe('totalDenominations', () => {
    it('totals an Indian cash drawer', () => {
        expect(totalDenominations({ 500: 4, 100: 5, 20: 3, 1: 7 })).toBe(2567);
    });

    it('treats absent denominations as zero', () => {
        expect(totalDenominations({ 500: 2 })).toBe(1000);
        expect(totalDenominations({})).toBe(0);
    });

    it('ignores negative and fractional note counts', () => {
        // You cannot hold -1 notes, nor half a note.
        expect(totalDenominations({ 500: -3, 100: 2.7 })).toBe(200);
    });
});
