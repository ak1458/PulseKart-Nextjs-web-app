/**
 * GST calculation for pharmacy retail.
 *
 * The one thing that trips up generic POS software in India: the MRP printed on
 * a medicine pack is **inclusive** of GST. Selling above it is an offence, so
 * the price is fixed and the tax is back-calculated out of it — you never add
 * tax on top of MRP. A system that treats MRP as a pre-tax rate overcharges the
 * customer by the tax amount on every line.
 */

/** Money is handled in paise internally to keep arithmetic exact. */
export type Rupees = number;

/**
 * Round to 2dp, half-up.
 *
 * `Math.round` is half-up for positives but half-*down* for negatives
 * (`Math.round(-0.5)` is `-0`), which matters for the round-off line and for
 * credit notes. This rounds away from zero on a tie, consistently.
 */
export function round2(value: number): number {
    if (!Number.isFinite(value)) return 0;
    const scaled = value * 100;
    const rounded = scaled < 0
        ? -Math.round(-scaled)
        : Math.round(scaled);
    return rounded / 100;
}

export interface TaxSplit {
    /** Price excluding GST. */
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    /** cgst + sgst + igst */
    totalTax: number;
}

/**
 * Split a GST-inclusive amount into its taxable value and tax components.
 *
 * Intra-state supply is split evenly into CGST and SGST; inter-state supply is
 * a single IGST line. Which applies is decided by comparing the place of supply
 * with the supplier's own state — not by anything the operator types.
 */
export function splitInclusiveTax(
    inclusiveAmount: number,
    gstRate: number,
    isInterState: boolean,
): TaxSplit {
    if (inclusiveAmount <= 0 || gstRate < 0) {
        return { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    }

    const taxableValue = round2(inclusiveAmount / (1 + gstRate / 100));
    // Derived by subtraction rather than multiplication so that
    // taxableValue + totalTax is always exactly the inclusive amount, with no
    // stray paisa left over on the invoice.
    const totalTax = round2(inclusiveAmount - taxableValue);

    if (isInterState) {
        return { taxableValue, cgst: 0, sgst: 0, igst: totalTax, totalTax };
    }

    // Half of an odd number of paise cannot split evenly. Give the remainder to
    // CGST and derive SGST by subtraction, so the two always sum to totalTax.
    const cgst = round2(totalTax / 2);
    const sgst = round2(totalTax - cgst);
    return { taxableValue, cgst, sgst, igst: 0, totalTax };
}

/**
 * Is this an inter-state supply?
 *
 * Compares GST state codes (the first two digits of a GSTIN). An unknown or
 * absent place of supply is treated as intra-state, which is the correct
 * default for an over-the-counter walk-in sale.
 */
export function isInterStateSupply(
    supplierStateCode: string,
    placeOfSupplyStateCode: string | null | undefined,
): boolean {
    if (!placeOfSupplyStateCode) return false;
    return supplierStateCode !== placeOfSupplyStateCode;
}

/** Extract the state code from a GSTIN. Returns null if malformed. */
export function stateCodeFromGstin(gstin: string | null | undefined): string | null {
    if (!gstin || gstin.length < 2) return null;
    const code = gstin.slice(0, 2);
    return /^[0-9]{2}$/.test(code) ? code : null;
}

const GSTIN_PATTERN =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Structural GSTIN validation.
 *
 * Checks the documented 15-character layout. This is a format check, not proof
 * the number is registered — only the GSTN portal can tell you that.
 */
export function isValidGstin(gstin: string): boolean {
    return GSTIN_PATTERN.test(gstin.toUpperCase());
}

export interface InvoiceLineInput {
    quantity: number;
    /** GST-inclusive unit price actually charged. Must not exceed batch MRP. */
    unitPrice: number;
    gstRate: number;
}

export interface InvoiceLine extends TaxSplit {
    quantity: number;
    unitPrice: number;
    gstRate: number;
    /** Inclusive line amount: quantity * unitPrice. */
    lineTotal: number;
}

export interface InvoiceTotals {
    lines: InvoiceLine[];
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    discount: number;
    /** Adjustment applied to reach a whole rupee, in -0.50..0.50. */
    roundOff: number;
    /** Final payable, rounded to the nearest rupee. */
    total: number;
}

/**
 * Build the invoice totals for a set of lines.
 *
 * `discount` is applied to the inclusive total. Indian retail invoices are
 * conventionally settled to the nearest rupee, with the adjustment shown as a
 * separate round-off line — so it is computed and stored, never hidden inside
 * another figure.
 */
export function calculateInvoice(
    lineInputs: InvoiceLineInput[],
    options: { isInterState: boolean; discount?: number },
): InvoiceTotals {
    const lines: InvoiceLine[] = lineInputs.map((input) => {
        const lineTotal = round2(input.quantity * input.unitPrice);
        const split = splitInclusiveTax(lineTotal, input.gstRate, options.isInterState);
        return {
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            gstRate: input.gstRate,
            lineTotal,
            ...split,
        };
    });

    const sum = (pick: (l: InvoiceLine) => number) =>
        round2(lines.reduce((acc, l) => acc + pick(l), 0));

    const inclusiveTotal = sum((l) => l.lineTotal);
    const discount = round2(Math.min(Math.max(options.discount ?? 0, 0), inclusiveTotal));
    const afterDiscount = round2(inclusiveTotal - discount);

    const total = Math.round(afterDiscount);
    const roundOff = round2(total - afterDiscount);

    return {
        lines,
        taxableValue: sum((l) => l.taxableValue),
        cgst: sum((l) => l.cgst),
        sgst: sum((l) => l.sgst),
        igst: sum((l) => l.igst),
        discount,
        roundOff,
        total,
    };
}

/**
 * The Indian financial year containing a date, as `YYYY-YY`.
 *
 * Runs 1 April to 31 March. GST requires invoice numbers to be a consecutive
 * series unique within the financial year, so the series resets here — not on
 * 1 January.
 */
export function financialYear(date: Date): string {
    const year = date.getFullYear();
    const startYear = date.getMonth() >= 3 ? year : year - 1;
    return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}
