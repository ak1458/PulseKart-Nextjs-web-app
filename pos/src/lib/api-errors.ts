import { NextResponse } from 'next/server';
import { UnauthorizedError, ForbiddenError } from './auth';
import { NoOpenShiftError, ShiftAlreadyOpenError } from './shifts';
import { DispenseRefusedError } from './sales';
import { InsufficientStockError } from '@/domain/dispensing';

/**
 * Map a thrown domain error onto an HTTP response.
 *
 * The messages here are written to be read by a person behind a counter with a
 * customer waiting, so they say what to do rather than what went wrong
 * internally. Anything unrecognised is logged and reported generically - an
 * unexpected failure must not leak a stack trace or a SQL constraint name onto
 * the till screen.
 */
export function toErrorResponse(error: unknown): NextResponse {
    if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof NoOpenShiftError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ShiftAlreadyOpenError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof InsufficientStockError) {
        return NextResponse.json(
            {
                error: error.message,
                productName: error.productName,
                available: error.available,
            },
            { status: 409 },
        );
    }
    if (error instanceof DispenseRefusedError) {
        return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof RangeError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Unhandled API error:', error);
    return NextResponse.json(
        { error: 'Something went wrong. The sale was not recorded.' },
        { status: 500 },
    );
}
