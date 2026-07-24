import { ValueTransformer } from 'typeorm';

/**
 * Converts Postgres `decimal`/`numeric` columns to JavaScript numbers on read.
 *
 * node-postgres returns these as strings to avoid the precision loss of IEEE-754,
 * which is correct but conflicts with entities that declare the field as
 * `number`. Without a transformer, `order.taxAmount` is `"5.00"` at runtime while
 * TypeScript believes it is `5`, so `taxAmount + shippingAmount` concatenates to
 * `"5.000.00"` and any subsequent arithmetic yields NaN. `reports.service.ts`
 * already worked around this with scattered `parseFloat` calls.
 *
 * Values are rounded to `scale` decimal places on write so that stored money
 * always matches what the application computed: 19.99 * 3 is 59.970000000000006
 * in binary floating point, and letting Postgres do that rounding silently makes
 * an order total disagree with the sum of its line items.
 *
 * This is safe for money at retail scale. It is not safe for values beyond
 * `Number.MAX_SAFE_INTEGER`; use a decimal library if that ever becomes a
 * concern.
 */
export class DecimalTransformer implements ValueTransformer {
    constructor(private readonly scale: number = 2) { }

    /** Entity -> database. */
    to(value: number | string | null | undefined): number | null {
        if (value === null || value === undefined) return null;
        const n = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(n)) return null;
        const factor = 10 ** this.scale;
        return Math.round((n + Number.EPSILON) * factor) / factor;
    }

    /** Database -> entity. */
    from(value: string | number | null | undefined): number | null {
        if (value === null || value === undefined) return null;
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n) ? n : null;
    }
}

/** Shared instance for the common money case, `decimal(10, 2)`. */
export const moneyTransformer = new DecimalTransformer(2);
