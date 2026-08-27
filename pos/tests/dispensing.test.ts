import { describe, it, expect } from 'vitest';
import {
    allocateFefo,
    classifyExpiry,
    checkDispensable,
    isExpired,
    endOfExpiryMonth,
    h1RetainUntil,
    InsufficientStockError,
    type Batch,
} from '../src/domain/dispensing';

const batch = (over: Partial<Batch> & Pick<Batch, 'id' | 'expiryDate'>): Batch => ({
    batchNo: `B-${over.id}`,
    mrp: 100,
    qtyAvailable: 10,
    ...over,
});

const NOW = new Date(2026, 6, 24); // 24 July 2026

describe('expiry is end-of-month', () => {
    it('treats a pack marked EXP 07/2026 as good through 31 July', () => {
        const july = new Date(2026, 6, 1);
        expect(endOfExpiryMonth(july).getDate()).toBe(31);
        expect(isExpired(batch({ id: '1', expiryDate: july }), NOW)).toBe(false);
    });

    it('expires it on 1 August', () => {
        const july = new Date(2026, 6, 1);
        expect(isExpired(batch({ id: '1', expiryDate: july }), new Date(2026, 7, 1))).toBe(true);
    });

    it('handles February in a leap year', () => {
        expect(endOfExpiryMonth(new Date(2028, 1, 1)).getDate()).toBe(29);
    });
});

describe('allocateFefo', () => {
    it('dispenses the earliest expiry first, not the earliest received', () => {
        const batches = [
            // Received later but expires sooner - FIFO would pick the wrong one.
            batch({ id: 'new', expiryDate: new Date(2026, 9, 1), qtyAvailable: 5 }),
            batch({ id: 'old', expiryDate: new Date(2027, 5, 1), qtyAvailable: 5 }),
        ];

        const allocations = allocateFefo(batches, 3, 'Amoxicillin', NOW);

        expect(allocations).toHaveLength(1);
        expect(allocations[0].batchId).toBe('new');
    });

    it('spans multiple batches in expiry order', () => {
        const batches = [
            batch({ id: 'a', expiryDate: new Date(2026, 9, 1), qtyAvailable: 4 }),
            batch({ id: 'b', expiryDate: new Date(2027, 0, 1), qtyAvailable: 10 }),
        ];

        const allocations = allocateFefo(batches, 6, 'Paracetamol', NOW);

        expect(allocations).toEqual([
            expect.objectContaining({ batchId: 'a', quantity: 4 }),
            expect.objectContaining({ batchId: 'b', quantity: 2 }),
        ]);
    });

    it('never allocates expired stock', () => {
        const batches = [
            batch({ id: 'expired', expiryDate: new Date(2026, 4, 1), qtyAvailable: 100 }),
            batch({ id: 'good', expiryDate: new Date(2027, 0, 1), qtyAvailable: 5 }),
        ];

        const allocations = allocateFefo(batches, 5, 'Azithromycin', NOW);

        expect(allocations).toHaveLength(1);
        expect(allocations[0].batchId).toBe('good');
    });

    it('refuses rather than partially filling when stock is short', () => {
        const batches = [batch({ id: 'a', expiryDate: new Date(2027, 0, 1), qtyAvailable: 2 })];

        expect(() => allocateFefo(batches, 5, 'Insulin', NOW))
            .toThrow(InsufficientStockError);
    });

    it('excludes expired stock from the available count it reports', () => {
        const batches = [
            batch({ id: 'expired', expiryDate: new Date(2026, 0, 1), qtyAvailable: 50 }),
            batch({ id: 'good', expiryDate: new Date(2027, 0, 1), qtyAvailable: 2 }),
        ];

        try {
            allocateFefo(batches, 10, 'Insulin', NOW);
            expect.unreachable('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(InsufficientStockError);
            expect((err as InsufficientStockError).available).toBe(2);
        }
    });

    it('is deterministic when two batches share an expiry date', () => {
        const batches = [
            batch({ id: 'z', batchNo: 'Z9', expiryDate: new Date(2027, 0, 1), qtyAvailable: 5 }),
            batch({ id: 'a', batchNo: 'A1', expiryDate: new Date(2027, 0, 1), qtyAvailable: 5 }),
        ];

        expect(allocateFefo(batches, 3, 'Metformin', NOW)[0].batchId).toBe('a');
    });

    it('rejects a non-positive quantity', () => {
        expect(() => allocateFefo([], 0, 'X', NOW)).toThrow(RangeError);
        expect(() => allocateFefo([], -1, 'X', NOW)).toThrow(RangeError);
    });
});

describe('classifyExpiry', () => {
    it('flags stock past end-of-month as expired', () => {
        expect(classifyExpiry(new Date(2026, 5, 1), 90, NOW)).toBe('expired');
    });

    it('escalates to critical inside the final third of the window', () => {
        // 90-day window -> critical at 30 days or fewer. July 2026 is sellable
        // through the 31st, which is 7 days out from NOW.
        expect(classifyExpiry(new Date(2026, 6, 1), 90, NOW)).toBe('critical');
    });

    it('warns inside the window', () => {
        // September 2026 ends 68 days out: inside 90, outside the critical 30.
        expect(classifyExpiry(new Date(2026, 8, 1), 90, NOW)).toBe('warning');
    });

    it('stays quiet well outside the window', () => {
        expect(classifyExpiry(new Date(2028, 0, 1), 90, NOW)).toBe('ok');
    });

    it("respects a pharmacy's shorter window", () => {
        // The same batch that warns at 90 days is quiet at 30.
        expect(classifyExpiry(new Date(2026, 8, 1), 30, NOW)).toBe('ok');
    });
});

describe('checkDispensable', () => {
    it('lets OTC through with no prescription', () => {
        const result = checkDispensable({ schedule: 'otc', hasPrescription: false });
        expect(result.allowed).toBe(true);
        expect(result.requiresH1Entry).toBe(false);
    });

    it('blocks Schedule H without a prescription', () => {
        const result = checkDispensable({ schedule: 'h', hasPrescription: false });
        expect(result.allowed).toBe(false);
        expect(result.reason).toMatch(/prescription/i);
    });

    it('allows Schedule H with a prescription and needs no register entry', () => {
        const result = checkDispensable({ schedule: 'h', hasPrescription: true });
        expect(result.allowed).toBe(true);
        expect(result.requiresH1Entry).toBe(false);
    });

    it('refuses Schedule H1 when register details are missing', () => {
        const result = checkDispensable({
            schedule: 'h1',
            hasPrescription: true,
            patientName: 'A. Patient',
            // prescriber details absent
        });

        expect(result.allowed).toBe(false);
        expect(result.requiresH1Entry).toBe(true);
        expect(result.reason).toMatch(/prescriber/i);
    });

    it('names every missing H1 field at once', () => {
        const result = checkDispensable({ schedule: 'h1', hasPrescription: true });

        expect(result.reason).toMatch(/patient name/i);
        expect(result.reason).toMatch(/prescriber's name/i);
        expect(result.reason).toMatch(/prescriber's address/i);
        expect(result.reason).toMatch(/registration number/i);
    });

    it('allows a complete H1 dispense and demands a register entry', () => {
        const result = checkDispensable({
            schedule: 'h1',
            hasPrescription: true,
            patientName: 'A. Patient',
            prescriberName: 'Dr B',
            prescriberAddress: '12 Clinic Road, Pune',
            pharmacistRegNo: 'MH-12345',
        });

        expect(result.allowed).toBe(true);
        expect(result.requiresH1Entry).toBe(true);
    });

    it('refuses Schedule X outright rather than pretending to support it', () => {
        const result = checkDispensable({ schedule: 'x', hasPrescription: true });

        expect(result.allowed).toBe(false);
        expect(result.reason).toMatch(/narcotics/i);
    });

    it('treats whitespace-only H1 details as missing', () => {
        const result = checkDispensable({
            schedule: 'h1',
            hasPrescription: true,
            patientName: '   ',
            prescriberName: 'Dr B',
            prescriberAddress: '12 Clinic Road',
            pharmacistRegNo: 'MH-1',
        });

        expect(result.allowed).toBe(false);
    });
});

describe('h1RetainUntil', () => {
    it('is three years from supply', () => {
        expect(h1RetainUntil(new Date(2026, 6, 24)).getFullYear()).toBe(2029);
    });
});
