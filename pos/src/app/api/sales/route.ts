import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createSale } from '@/lib/sales';
import { toErrorResponse } from '@/lib/api-errors';

const saleSchema = z.object({
    clientUuid: z.string().uuid(),
    outletId: z.string().uuid(),
    lines: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10_000),
        unitPrice: z.number().min(0).optional(),
    })).min(1),
    paymentMode: z.enum(['cash', 'card', 'upi', 'credit']),
    customerName: z.string().max(120).optional(),
    customerPhone: z.string().max(20).optional(),
    customerGstin: z.string().length(15).optional(),
    placeOfSupplyStateCode: z.string().length(2).optional(),
    discount: z.number().min(0).optional(),
    hasPrescription: z.boolean().optional(),
    h1: z.object({
        patientName: z.string().min(1),
        prescriberName: z.string().min(1),
        prescriberAddress: z.string().min(1),
        prescriberRegNo: z.string().optional(),
        prescriptionRef: z.string().optional(),
    }).optional(),
});

export async function POST(request: Request) {
    try {
        const user = await requireUser();
        const parsed = saleSchema.parse(await request.json());
        const result = await createSale(user, parsed);

        // 200 rather than 201 for a replay, so a retrying till can tell it did
        // not create a second sale.
        return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Check the sale details.', fieldErrors: error.flatten().fieldErrors },
                { status: 400 },
            );
        }
        return toErrorResponse(error);
    }
}
