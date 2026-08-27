import { describe, it, expect } from 'vitest';
import {
    round2,
    splitInclusiveTax,
    isInterStateSupply,
    stateCodeFromGstin,
    isValidGstin,
    calculateInvoice,
    financialYear,
} from '../src/domain/gst';

describe('round2', () => {
    it('rounds half away from zero in both directions', () => {
        // Math.round(-0.5) is -0, which would bias every negative adjustment.
        expect(round2(0.125)).toBe(0.13);
        expect(round2(-0.125)).toBe(-0.13);
        expect(round2(2.675)).toBe(2.68);
    });

    it('does not propagate NaN into money', () => {
        expect(round2(NaN)).toBe(0);
        expect(round2(Infinity)).toBe(0);
    });
});

describe('splitInclusiveTax', () => {
    it('treats MRP as tax-inclusive rather than adding tax on top', () => {
        // ₹112 at 12% GST is ₹100 + ₹12, NOT ₹112 + ₹13.44.
        const split = splitInclusiveTax(112, 12, false);

        expect(split.taxableValue).toBe(100);
        expect(split.totalTax).toBe(12);
        expect(split.taxableValue + split.totalTax).toBe(112);
    });

    it('splits intra-state tax into equal CGST and SGST', () => {
        const split = splitInclusiveTax(112, 12, false);

        expect(split.cgst).toBe(6);
        expect(split.sgst).toBe(6);
        expect(split.igst).toBe(0);
    });

    it('uses a single IGST line for inter-state supply', () => {
        const split = splitInclusiveTax(112, 12, true);

        expect(split.igst).toBe(12);
        expect(split.cgst).toBe(0);
        expect(split.sgst).toBe(0);
    });

    it('never loses a paisa when the tax will not halve evenly', () => {
        // Chosen so totalTax is an odd number of paise.
        const split = splitInclusiveTax(105.01, 5, false);

        expect(round2(split.cgst + split.sgst)).toBe(split.totalTax);
        expect(round2(split.taxableValue + split.totalTax)).toBe(105.01);
    });

    it('handles a zero-rated item', () => {
        const split = splitInclusiveTax(100, 0, false);

        expect(split.taxableValue).toBe(100);
        expect(split.totalTax).toBe(0);
    });

    it('returns zeroes rather than negatives for a non-positive amount', () => {
        expect(splitInclusiveTax(0, 12, false).totalTax).toBe(0);
        expect(splitInclusiveTax(-50, 12, false).taxableValue).toBe(0);
    });
});

describe('place of supply', () => {
    it('is intra-state when the codes match', () => {
        expect(isInterStateSupply('27', '27')).toBe(false);
    });

    it('is inter-state when they differ', () => {
        expect(isInterStateSupply('27', '29')).toBe(true);
    });

    it('defaults a walk-in with no stated place of supply to intra-state', () => {
        expect(isInterStateSupply('27', null)).toBe(false);
        expect(isInterStateSupply('27', undefined)).toBe(false);
    });

    it('reads the state code off a GSTIN', () => {
        expect(stateCodeFromGstin('27AAPFU0939F1ZV')).toBe('27');
        expect(stateCodeFromGstin('bad')).toBeNull();
        expect(stateCodeFromGstin(null)).toBeNull();
    });
});

describe('isValidGstin', () => {
    it('accepts a structurally valid GSTIN', () => {
        expect(isValidGstin('27AAPFU0939F1ZV')).toBe(true);
    });

    it('rejects wrong length, wrong layout, and a missing Z', () => {
        expect(isValidGstin('27AAPFU0939F1Z')).toBe(false);
        expect(isValidGstin('AA27PFU0939F1ZV')).toBe(false);
        expect(isValidGstin('27AAPFU0939F1XV')).toBe(false);
    });
});

describe('calculateInvoice', () => {
    it('settles to a whole rupee and shows the adjustment separately', () => {
        const invoice = calculateInvoice(
            [{ quantity: 3, unitPrice: 33.5, gstRate: 12 }],
            { isInterState: false },
        );

        // 3 * 33.50 = 100.50 -> settles to 101 (half-up), round-off +0.50
        expect(invoice.total).toBe(101);
        expect(invoice.roundOff).toBe(0.5);
    });

    it('keeps round-off within half a rupee', () => {
        for (const unitPrice of [10.01, 10.49, 10.5, 10.99, 33.33]) {
            const invoice = calculateInvoice(
                [{ quantity: 3, unitPrice, gstRate: 5 }],
                { isInterState: false },
            );
            expect(Math.abs(invoice.roundOff)).toBeLessThanOrEqual(0.5);
        }
    });

    it('sums tax across lines at different GST rates', () => {
        const invoice = calculateInvoice(
            [
                { quantity: 1, unitPrice: 105, gstRate: 5 },
                { quantity: 1, unitPrice: 112, gstRate: 12 },
            ],
            { isInterState: false },
        );

        expect(invoice.taxableValue).toBe(200);
        expect(round2(invoice.cgst + invoice.sgst)).toBe(17);
        expect(invoice.total).toBe(217);
    });

    it('applies a discount to the inclusive total', () => {
        const invoice = calculateInvoice(
            [{ quantity: 1, unitPrice: 112, gstRate: 12 }],
            { isInterState: false, discount: 12 },
        );

        expect(invoice.discount).toBe(12);
        expect(invoice.total).toBe(100);
    });

    it('never lets a discount drive the total negative', () => {
        const invoice = calculateInvoice(
            [{ quantity: 1, unitPrice: 100, gstRate: 12 }],
            { isInterState: false, discount: 10_000 },
        );

        expect(invoice.discount).toBe(100);
        expect(invoice.total).toBe(0);
    });

    it('ignores a negative discount', () => {
        const invoice = calculateInvoice(
            [{ quantity: 1, unitPrice: 100, gstRate: 12 }],
            { isInterState: false, discount: -50 },
        );

        expect(invoice.discount).toBe(0);
    });

    it('routes everything to IGST for an inter-state invoice', () => {
        const invoice = calculateInvoice(
            [{ quantity: 2, unitPrice: 112, gstRate: 12 }],
            { isInterState: true },
        );

        expect(invoice.cgst).toBe(0);
        expect(invoice.sgst).toBe(0);
        expect(invoice.igst).toBe(24);
    });
});

describe('financialYear', () => {
    it('starts the year on 1 April, not 1 January', () => {
        expect(financialYear(new Date(2026, 3, 1))).toBe('2026-27');
        expect(financialYear(new Date(2026, 2, 31))).toBe('2025-26');
    });

    it('keeps January to March in the previous year', () => {
        expect(financialYear(new Date(2027, 0, 15))).toBe('2026-27');
        expect(financialYear(new Date(2026, 11, 31))).toBe('2026-27');
    });

    it('pads the century rollover', () => {
        expect(financialYear(new Date(2099, 5, 1))).toBe('2099-00');
    });
});
