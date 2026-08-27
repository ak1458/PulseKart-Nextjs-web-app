import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCredentials, createSession } from '@/lib/auth';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        const user = await verifyCredentials(email, password);
        if (!user) {
            // One message for both causes, so the response cannot be used to
            // discover which addresses are registered.
            return NextResponse.json(
                { error: 'Those details do not match an account.' },
                { status: 401 },
            );
        }

        await createSession(user);
        return NextResponse.json({
            user: { id: user.id, name: user.name, role: user.role },
        });
    } catch {
        return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    }
}
