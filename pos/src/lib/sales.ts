import type { PoolClient } from 'pg';
import { transaction, query } from './db';
import {
    allocateFefo,
    checkDispensable,
    h1RetainUntil,
    InsufficientStockError,
    type Batch,
} from '@/domain/dispensing';
import {
    calculateInvoice,
    financialYear,
    isInterStateSupply,
    round2,
    type InvoiceLineInput,
} from '@/domain/gst';
import type { SessionUser } from './auth';
import { getOpenShift, NoOpenShiftError } from './shifts';

/**
 * Recording a sale.
 *
 * Everything below happens in one transaction: stock allocation, the invoice
 * number, the sale and its lines, the stock ledger and the H1 register. A sale
 * that half-committed would leave stock decremented with nothing sold, or an
 * H1 drug dispensed with no register entry — the second of which is a
 * regulatory failure, not just a data one.
 */

export type PaymentMode = 'cash' | 'card' | 'upi' | 'credit';

export interface SaleLineRequest {
    productId: string;
    quantity: number;
    /**
     * Optional override of the price charged, GST-inclusive. Cannot exceed the
     * batch MRP — selling above the printed MRP is an offence, so the server
     * clamps rather than trusting the till.
     */
    unitPrice?: number;
}

export interface H1Details {
    patientName: string;
    prescriberName: string;
    prescriberAddress: string;
    prescriberRegNo?: string;
    prescriptionRef?: string;
}

export interface CreateSaleRequest {
    /** Minted by the client so an offline sale replayed after reconnect cannot insert twice. */
    clientUuid: string;
    outletId: string;
    lines: SaleLineRequest[];
    paymentMode: PaymentMode;
    customerName?: string;
    customerPhone?: string;
    customerGstin?: string;
    placeOfSupplyStateCode?: string;
    discount?: number;
    hasPrescription?: boolean;
    h1?: H1Details;
}

export interface SaleResult {
    id: string;
    invoiceNo: string;
    financialYear: string;
    total: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    roundOff: number;
    duplicate: boolean;
}

export class DispenseRefusedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DispenseRefusedError';
    }
}

interface ProductRow {
    id: string;
    name: string;
    hsn_code: string | null;
    gst_rate: string;
    schedule: 'otc' | 'h' | 'h1' | 'x';
}

/**
 * Next invoice number for an outlet in the current financial year.
 *
 * GST requires a consecutive series unique within the financial year. The
 * outlet row is locked FOR UPDATE first, so two tills billing at the same
 * instant queue rather than both reading the same maximum and producing a
 * duplicate number — which would be a defective invoice, not just a clash.
 */
async function nextInvoiceNumber(
    client: PoolClient,
    outletId: string,
    fy: string,
): Promise<{ invoiceNo: string; prefix: string }> {
    const outlet = await client.query<{ invoice_prefix: string }>(
        'SELECT invoice_prefix FROM outlets WHERE id = $1 FOR UPDATE',
        [outletId],
    );

    if (outlet.rowCount === 0) {
        throw new Error('That counter does not exist.');
    }

    const prefix = outlet.rows[0].invoice_prefix;

    const last = await client.query<{ max_seq: string | null }>(
        `SELECT MAX(
                    CAST(NULLIF(regexp_replace(invoice_no, '^.*/', ''), '') AS INTEGER)
                ) AS max_seq
           FROM sales
          WHERE outlet_id = $1 AND financial_year = $2`,
        [outletId, fy],
    );

    const next = Number(last.rows[0]?.max_seq ?? 0) + 1;
    return {
        prefix,
        invoiceNo: `${prefix}/${fy}/${String(next).padStart(4, '0')}`,
    };
}

export async function createSale(
    user: SessionUser,
    request: CreateSaleRequest,
): Promise<SaleResult> {
    if (request.lines.length === 0) {
        throw new RangeError('A sale must have at least one line.');
    }

    // Replay of an already-recorded sale returns the original rather than
    // failing, so a till retrying after a dropped connection is not punished.
    const existing = await query<{ id: string; invoice_no: string; financial_year: string; total: string; taxable_value: string; cgst: string; sgst: string; igst: string; round_off: string }>(
        `SELECT id, invoice_no, financial_year, total, taxable_value, cgst, sgst, igst, round_off
           FROM sales WHERE pharmacy_id = $1 AND client_uuid = $2`,
        [user.pharmacyId, request.clientUuid],
    );

    if (existing[0]) {
        const row = existing[0];
        return {
            id: row.id,
            invoiceNo: row.invoice_no,
            financialYear: row.financial_year,
            total: Number(row.total),
            taxableValue: Number(row.taxable_value),
            cgst: Number(row.cgst),
            sgst: Number(row.sgst),
            igst: Number(row.igst),
            roundOff: Number(row.round_off),
            duplicate: true,
        };
    }

    const shift = await getOpenShift(request.outletId);
    if (!shift) throw new NoOpenShiftError();

    const pharmacy = await query<{ state_code: string }>(
        'SELECT state_code FROM pharmacies WHERE id = $1',
        [user.pharmacyId],
    );
    const supplierState = pharmacy[0]?.state_code ?? '';

    const soldAt = new Date();
    const fy = financialYear(soldAt);

    return transaction(async (client) => {
        const productIds = [...new Set(request.lines.map((l) => l.productId))];

        const products = await client.query<ProductRow>(
            `SELECT id, name, hsn_code, gst_rate, schedule
               FROM products
              WHERE pharmacy_id = $1 AND id = ANY($2::uuid[]) AND is_active`,
            [user.pharmacyId, productIds],
        );

        const byId = new Map(products.rows.map((p) => [p.id, p]));
        const missing = productIds.filter((id) => !byId.has(id));
        if (missing.length > 0) {
            throw new DispenseRefusedError('One or more items are no longer in the catalogue.');
        }

        // Schedule checks before any stock moves, so a refusal leaves nothing
        // half-allocated.
        let requiresH1Entry = false;
        for (const product of products.rows) {
            const check = checkDispensable({
                schedule: product.schedule,
                hasPrescription: request.hasPrescription === true,
                patientName: request.h1?.patientName,
                prescriberName: request.h1?.prescriberName,
                prescriberAddress: request.h1?.prescriberAddress,
                pharmacistRegNo: user.pharmacistRegNo,
            });

            if (!check.allowed) {
                throw new DispenseRefusedError(`${product.name}: ${check.reason}`);
            }
            if (check.requiresH1Entry) requiresH1Entry = true;
        }

        // Only a registered pharmacist may dispense H1.
        if (requiresH1Entry && !['owner', 'pharmacist'].includes(user.role)) {
            throw new DispenseRefusedError(
                'Schedule H1 medicines must be dispensed by a registered pharmacist.',
            );
        }

        const invoiceLines: InvoiceLineInput[] = [];
        const persistLines: {
            productId: string;
            productName: string;
            batchId: string;
            batchNo: string;
            expiryDate: Date;
            hsnCode: string | null;
            quantity: number;
            mrp: number;
            unitPrice: number;
            gstRate: number;
        }[] = [];

        for (const line of request.lines) {
            const product = byId.get(line.productId)!;

            // Locked so two concurrent sales cannot both read the same
            // qty_available and each conclude there is enough.
            const batchRows = await client.query<{
                id: string; batch_no: string; expiry_date: string;
                mrp: string; qty_available: number;
            }>(
                `SELECT id, batch_no, expiry_date, mrp, qty_available
                   FROM batches
                  WHERE pharmacy_id = $1 AND outlet_id = $2 AND product_id = $3
                    AND qty_available > 0
                  FOR UPDATE`,
                [user.pharmacyId, request.outletId, line.productId],
            );

            const batches: Batch[] = batchRows.rows.map((b) => ({
                id: b.id,
                batchNo: b.batch_no,
                expiryDate: new Date(b.expiry_date),
                mrp: Number(b.mrp),
                qtyAvailable: b.qty_available,
            }));

            const allocations = allocateFefo(batches, line.quantity, product.name, soldAt);
            const gstRate = Number(product.gst_rate);

            for (const allocation of allocations) {
                // Never above the batch's printed MRP.
                const unitPrice = line.unitPrice === undefined
                    ? allocation.mrp
                    : round2(Math.min(line.unitPrice, allocation.mrp));

                invoiceLines.push({ quantity: allocation.quantity, unitPrice, gstRate });
                persistLines.push({
                    productId: product.id,
                    productName: product.name,
                    batchId: allocation.batchId,
                    batchNo: allocation.batchNo,
                    expiryDate: allocation.expiryDate,
                    hsnCode: product.hsn_code,
                    quantity: allocation.quantity,
                    mrp: allocation.mrp,
                    unitPrice,
                    gstRate,
                });

                await client.query(
                    `UPDATE batches SET qty_available = qty_available - $2 WHERE id = $1`,
                    [allocation.batchId, allocation.quantity],
                );
            }
        }

        const placeOfSupply = request.placeOfSupplyStateCode || supplierState;
        const invoice = calculateInvoice(invoiceLines, {
            isInterState: isInterStateSupply(supplierState, placeOfSupply),
            discount: request.discount,
        });

        const { invoiceNo } = await nextInvoiceNumber(client, request.outletId, fy);

        const saleRows = await client.query<{ id: string }>(
            `INSERT INTO sales
                (pharmacy_id, outlet_id, shift_id, invoice_no, financial_year,
                 sold_by, sold_at, customer_name, customer_phone, customer_gstin,
                 place_of_supply_state_code, taxable_value, cgst, sgst, igst,
                 discount, round_off, total, payment_mode, client_uuid)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
             RETURNING id`,
            [
                user.pharmacyId, request.outletId, shift.id, invoiceNo, fy,
                user.id, soldAt, request.customerName ?? null,
                request.customerPhone ?? null, request.customerGstin ?? null,
                placeOfSupply, invoice.taxableValue, invoice.cgst, invoice.sgst,
                invoice.igst, invoice.discount, invoice.roundOff, invoice.total,
                request.paymentMode, request.clientUuid,
            ],
        );

        const saleId = saleRows.rows[0].id;

        for (let i = 0; i < persistLines.length; i += 1) {
            const line = persistLines[i];
            const computed = invoice.lines[i];

            await client.query(
                `INSERT INTO sale_items
                    (sale_id, batch_id, product_id, product_name, batch_no,
                     expiry_date, hsn_code, quantity, mrp, rate, gst_rate,
                     taxable_value, tax_amount, line_total)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
                [
                    saleId, line.batchId, line.productId, line.productName,
                    line.batchNo, line.expiryDate, line.hsnCode, line.quantity,
                    line.mrp, computed.taxableValue / line.quantity,
                    line.gstRate, computed.taxableValue, computed.totalTax,
                    computed.lineTotal,
                ],
            );

            await client.query(
                `INSERT INTO stock_movements
                    (pharmacy_id, batch_id, quantity_delta, reason, reference_id, performed_by)
                 VALUES ($1, $2, $3, 'sale', $4, $5)`,
                [user.pharmacyId, line.batchId, -line.quantity, saleId, user.id],
            );

            // One register row per H1 line. checkDispensable has already proved
            // the details are present, so this cannot write a partial entry.
            if (requiresH1Entry && byId.get(line.productId)!.schedule === 'h1') {
                await client.query(
                    `INSERT INTO h1_register
                        (pharmacy_id, sale_id, supplied_at, drug_name, batch_no,
                         quantity, patient_name, prescriber_name, prescriber_address,
                         prescriber_reg_no, dispensed_by, pharmacist_reg_no,
                         prescription_ref, retain_until)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
                    [
                        user.pharmacyId, saleId, soldAt, line.productName,
                        line.batchNo, line.quantity, request.h1!.patientName,
                        request.h1!.prescriberName, request.h1!.prescriberAddress,
                        request.h1!.prescriberRegNo ?? null, user.id,
                        user.pharmacistRegNo, request.h1!.prescriptionRef ?? null,
                        h1RetainUntil(soldAt),
                    ],
                );
            }
        }

        return {
            id: saleId,
            invoiceNo,
            financialYear: fy,
            total: invoice.total,
            taxableValue: invoice.taxableValue,
            cgst: invoice.cgst,
            sgst: invoice.sgst,
            igst: invoice.igst,
            roundOff: invoice.roundOff,
            duplicate: false,
        };
    });
}

export { InsufficientStockError };
