import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { toErrorResponse } from '@/lib/api-errors';

/** The signed-in user and the counters they can bill from. */
export async function GET() {
    try {
        const user = await requireUser();

        const outlets = await query<{ id: string; name: string }>(
            'SELECT id, name FROM outlets WHERE pharmacy_id = $1 ORDER BY name',
            [user.pharmacyId],
        );

        const pharmacy = await query<{ name: string; state_code: string }>(
            'SELECT name, state_code FROM pharmacies WHERE id = $1',
            [user.pharmacyId],
        );

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                // Surfaced so the till can tell the operator *why* an H1 sale
                // will be refused before they scan it, not after.
                canDispenseH1:
                    ['owner', 'pharmacist'].includes(user.role) &&
                    Boolean(user.pharmacistRegNo),
            },
            pharmacy: pharmacy[0] ?? null,
            outlets,
        });
    } catch (error) {
        return toErrorResponse(error);
    }
}
