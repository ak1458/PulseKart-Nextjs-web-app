/**
 * Batch selection and dispensing rules.
 *
 * FEFO — first-expired-first-out — rather than FIFO. For medicines the two
 * differ and the difference costs money: a batch received later may expire
 * sooner, and shipping the longest-dated stock first strands the near-dated
 * stock until it has to be written off. Every current pharmacy-POS buyer's
 * guide treats FEFO as a core requirement rather than an option.
 */

export interface Batch {
    id: string;
    batchNo: string;
    expiryDate: Date;
    mrp: number;
    qtyAvailable: number;
}

export interface Allocation {
    batchId: string;
    batchNo: string;
    expiryDate: Date;
    mrp: number;
    quantity: number;
}

export class InsufficientStockError extends Error {
    constructor(
        readonly productName: string,
        readonly requested: number,
        readonly available: number,
    ) {
        super(
            `Not enough stock for ${productName}: ${requested} requested, ${available} sellable.`,
        );
        this.name = 'InsufficientStockError';
    }
}

/** A batch is sellable if it has stock and has not expired. */
export function isSellable(batch: Batch, asOf: Date): boolean {
    return batch.qtyAvailable > 0 && !isExpired(batch, asOf);
}

/**
 * Expiry is end-of-month.
 *
 * A pack marked "EXP 03/2027" is good through 31 March 2027, not 1 March. This
 * is the single most common off-by-one in pharmacy stock code, and it fails in
 * the expensive direction: writing off a month of saleable stock early, or —
 * worse — selling a month past the real date if the comparison is inverted.
 */
export function isExpired(batch: Batch, asOf: Date): boolean {
    return endOfExpiryMonth(batch.expiryDate) < asOf;
}

export function endOfExpiryMonth(expiry: Date): Date {
    // Day 0 of the following month is the last day of this one.
    return new Date(expiry.getFullYear(), expiry.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Allocate `quantity` units across batches, oldest expiry first.
 *
 * Throws rather than partially allocating: a half-filled line silently short-
 * changes the customer and leaves the invoice disagreeing with the stock ledger.
 */
export function allocateFefo(
    batches: Batch[],
    quantity: number,
    productName: string,
    asOf: Date = new Date(),
): Allocation[] {
    if (quantity <= 0) {
        throw new RangeError('Quantity must be greater than zero');
    }

    const sellable = batches
        .filter((b) => isSellable(b, asOf))
        .sort((a, b) => {
            const byExpiry = a.expiryDate.getTime() - b.expiryDate.getTime();
            // Stable tie-break so allocation is deterministic and testable when
            // two batches share an expiry date.
            return byExpiry !== 0 ? byExpiry : a.batchNo.localeCompare(b.batchNo);
        });

    const available = sellable.reduce((sum, b) => sum + b.qtyAvailable, 0);
    if (available < quantity) {
        throw new InsufficientStockError(productName, quantity, available);
    }

    const allocations: Allocation[] = [];
    let remaining = quantity;

    for (const batch of sellable) {
        if (remaining === 0) break;
        const take = Math.min(batch.qtyAvailable, remaining);
        allocations.push({
            batchId: batch.id,
            batchNo: batch.batchNo,
            expiryDate: batch.expiryDate,
            mrp: batch.mrp,
            quantity: take,
        });
        remaining -= take;
    }

    return allocations;
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'ok';

/**
 * Classify a batch for the expiry dashboard.
 *
 * `warnDays` is per pharmacy (30/60/90 are the usual tiers). "Critical" is the
 * final third of the warning window — the point at which most suppliers will
 * still accept a return, so it is the last chance to recover the money rather
 * than write it off.
 */
export function classifyExpiry(
    expiryDate: Date,
    warnDays: number,
    asOf: Date = new Date(),
): ExpiryStatus {
    const lastSellable = endOfExpiryMonth(expiryDate);
    if (lastSellable < asOf) return 'expired';

    const daysLeft = Math.floor(
        (lastSellable.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft <= Math.floor(warnDays / 3)) return 'critical';
    if (daysLeft <= warnDays) return 'warning';
    return 'ok';
}

/**
 * May this item be sold given what the operator supplied?
 *
 * Schedule H and H1 need a prescription; H1 additionally needs the register
 * entry, which needs prescriber and patient details. Schedule X is refused
 * outright here — it carries narcotics controls this system does not implement,
 * and silently allowing it would be worse than not supporting it.
 */
export interface DispenseCheckInput {
    schedule: 'otc' | 'h' | 'h1' | 'x';
    hasPrescription: boolean;
    patientName?: string | null;
    prescriberName?: string | null;
    prescriberAddress?: string | null;
    /** Council registration of the dispensing pharmacist. */
    pharmacistRegNo?: string | null;
}

export interface DispenseCheckResult {
    allowed: boolean;
    /** Set when this sale must produce an H1 register entry. */
    requiresH1Entry: boolean;
    reason?: string;
}

export function checkDispensable(input: DispenseCheckInput): DispenseCheckResult {
    if (input.schedule === 'otc') {
        return { allowed: true, requiresH1Entry: false };
    }

    if (input.schedule === 'x') {
        return {
            allowed: false,
            requiresH1Entry: false,
            reason:
                'Schedule X drugs require narcotics controls this system does not implement.',
        };
    }

    if (!input.hasPrescription) {
        return {
            allowed: false,
            requiresH1Entry: false,
            reason: `Schedule ${input.schedule.toUpperCase()} drugs require a valid prescription.`,
        };
    }

    if (input.schedule === 'h') {
        return { allowed: true, requiresH1Entry: false };
    }

    // Schedule H1: the register entry is a legal requirement, so the details it
    // needs are collected before the sale completes, not after.
    const missing: string[] = [];
    if (!input.patientName?.trim()) missing.push('patient name');
    if (!input.prescriberName?.trim()) missing.push("prescriber's name");
    if (!input.prescriberAddress?.trim()) missing.push("prescriber's address");
    if (!input.pharmacistRegNo?.trim()) {
        missing.push('registration number of the dispensing pharmacist');
    }

    if (missing.length > 0) {
        return {
            allowed: false,
            requiresH1Entry: true,
            reason: `Schedule H1 register requires: ${missing.join(', ')}.`,
        };
    }

    return { allowed: true, requiresH1Entry: true };
}

/** H1 records must be retained for three years from supply. */
export function h1RetainUntil(suppliedAt: Date): Date {
    const retain = new Date(suppliedAt);
    retain.setFullYear(retain.getFullYear() + 3);
    return retain;
}
