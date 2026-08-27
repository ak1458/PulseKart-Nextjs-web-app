import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { getOpenShift, openShift, closeShift, getShiftSummary } from '@/lib/shifts';
import { toErrorResponse } from '@/lib/api-errors';

/** The open shift for a counter, with its running takings. */
export async function GET(request: Request) {
    try {
        await requireUser();
        const outletId = new URL(request.url).searchParams.get('outletId');
        if (!outletId) {
            return NextResponse.json({ error: 'outletId is required' }, { status: 400 });
        }

        const shift = await getOpenShift(outletId);
        if (!shift) return NextResponse.json({ shift: null });

        return NextResponse.json({ shift, summary: await getShiftSummary(shift.id) });
    } catch (error) {
        return toErrorResponse(error);
    }
}

const openSchema = z.object({
    outletId: z.string().uuid(),
    openingFloat: z.number().min(0),
});

export async function POST(request: Request) {
    try {
        const user = await requireUser();
        const { outletId, openingFloat } = openSchema.parse(await request.json());
        return NextResponse.json({ shift: await openShift(user, outletId, openingFloat) }, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

const closeSchema = z.object({
    shiftId: z.string().uuid(),
    countedCash: z.number().min(0),
    note: z.string().max(500).optional(),
});

/**
 * Close a shift.
 *
 * Restricted to owner and pharmacist: a cashier counting and signing off their
 * own drawer defeats the point of the count.
 */
export async function PATCH(request: Request) {
    try {
        const user = await requireUser(['owner', 'pharmacist']);
        const { shiftId, countedCash, note } = closeSchema.parse(await request.json());
        return NextResponse.json(await closeShift(user, shiftId, countedCash, note));
    } catch (error) {
        return toErrorResponse(error);
    }
}
