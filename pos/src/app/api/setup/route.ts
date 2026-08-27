import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
    setupSchema,
    install,
    isInstalled,
    preflight,
    runMigrations,
    SetupAlreadyCompletedError,
} from '@/lib/setup';

/** Pre-flight status for the wizard's first screen. */
export async function GET() {
    if (await isInstalled()) {
        return NextResponse.json({ installed: true, checks: [] });
    }

    return NextResponse.json({ installed: false, checks: await preflight() });
}

/**
 * Apply the schema and create the pharmacy, counter and owner account.
 *
 * Deliberately unauthenticated: before the first account exists there is nobody
 * to authenticate as. `install()` is guarded by `install_state.completed_at`
 * under a row lock, so this endpoint stops working the moment it succeeds once.
 */
export async function POST(request: Request) {
    try {
        if (await isInstalled()) {
            return NextResponse.json(
                { error: 'Setup has already been completed.' },
                { status: 409 },
            );
        }

        const body = await request.json();
        const input = setupSchema.parse(body);

        // Schema first: install() writes to tables these create.
        await runMigrations();

        const result = await install(input);

        return NextResponse.json({ ok: true, ...result }, { status: 201 });
    } catch (error) {
        if (error instanceof SetupAlreadyCompletedError) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: 'Please check the highlighted fields.',
                    // Flattened so the form can show each message beside its field.
                    fieldErrors: error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        // Surface the real reason. A generic "setup failed" here would leave a
        // non-technical installer with nothing to act on, and this endpoint is
        // unreachable once setup succeeds.
        const message = error instanceof Error ? error.message : 'Setup failed.';
        console.error('Setup failed:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
