import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { toErrorResponse } from '@/lib/api-errors';
import { classifyExpiry } from '@/domain/dispensing';

/**
 * Search sellable stock for the till.
 *
 * Returns only products with unexpired stock on hand, with the earliest expiry
 * surfaced so the counter can see what it will dispense before it commits.
 */
export async function GET(request: Request) {
    try {
        const user = await requireUser();
        const params = new URL(request.url).searchParams;
        const term = (params.get('q') ?? '').trim();
        const outletId = params.get('outletId');

        if (!outletId) {
            return NextResponse.json({ error: 'outletId is required' }, { status: 400 });
        }
        if (term.length < 2) {
            return NextResponse.json({ products: [] });
        }

        const rows = await query<Record<string, unknown>>(
            `SELECT p.id, p.name, p.generic_name, p.manufacturer, p.schedule,
                    p.gst_rate, p.pack_size,
                    SUM(b.qty_available)::int AS in_stock,
                    MIN(b.expiry_date)        AS next_expiry,
                    MIN(b.mrp)                AS mrp,
                    ph.expiry_warn_days
               FROM products p
               JOIN batches b   ON b.product_id = p.id AND b.outlet_id = $2
               JOIN pharmacies ph ON ph.id = p.pharmacy_id
              WHERE p.pharmacy_id = $1
                AND p.is_active
                AND b.qty_available > 0
                AND b.expiry_date >= date_trunc('month', CURRENT_DATE)
                AND (p.name ILIKE $3 OR p.generic_name ILIKE $3)
              GROUP BY p.id, ph.expiry_warn_days
              ORDER BY p.name
              LIMIT 25`,
            [user.pharmacyId, outletId, `%${term}%`],
        );

        return NextResponse.json({
            products: rows.map((row) => {
                const nextExpiry = new Date(row.next_expiry as string);
                return {
                    id: String(row.id),
                    name: String(row.name),
                    genericName: row.generic_name ?? null,
                    manufacturer: row.manufacturer ?? null,
                    schedule: row.schedule,
                    gstRate: Number(row.gst_rate),
                    packSize: Number(row.pack_size),
                    inStock: Number(row.in_stock),
                    mrp: Number(row.mrp),
                    nextExpiry: nextExpiry.toISOString(),
                    expiryStatus: classifyExpiry(nextExpiry, Number(row.expiry_warn_days)),
                };
            }),
        });
    } catch (error) {
        return toErrorResponse(error);
    }
}
