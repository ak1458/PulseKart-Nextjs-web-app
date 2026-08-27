import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { serverApiUrl } from '@/lib/api';

const SYSTEM_PROMPT = `You are the AI Admin Worker for PulseKart, a pharmacy and e-commerce platform.

You do not have access to live order, inventory or prescription data. Never
invent counts, totals, stock levels or patient details - if you are asked for
figures you have not been given, say plainly that you cannot see that data yet
and describe what the operator should check instead.

Keep responses concise and professional.`;

/**
 * Confirm the caller is a signed-in admin.
 *
 * This route was previously unauthenticated: any anonymous request could drive
 * an OpenAI completion against the deployment's API key.
 */
async function requireAdmin(req: Request): Promise<boolean> {
    const authorization = req.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return false;

    try {
        const res = await fetch(serverApiUrl('auth/me'), {
            headers: { authorization, 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) return false;
        const user = await res.json();
        return user?.role === 'admin';
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    if (!(await requireAdmin(req))) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        );
    }

    let body: { messages?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
            { error: '`messages` must be a non-empty array' },
            { status: 400 },
        );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
        // Report the misconfiguration rather than answering anyway. The previous
        // version fell through to canned replies such as "Inventory status: 98%
        // healthy" and "I found 5 pending orders", rendered in the admin console
        // indistinguishably from real figures. Fabricated operational numbers in
        // a pharmacy back-office are worse than no answer.
        return NextResponse.json(
            {
                error: 'The AI assistant is not configured. Set OPENAI_API_KEY to enable it.',
                configured: false,
            },
            { status: 503 },
        );
    }

    try {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        });

        return NextResponse.json({
            role: 'assistant',
            content: completion.choices[0]?.message?.content ?? '',
        });
    } catch (error) {
        console.error('AI completion failed:', error);
        return NextResponse.json(
            { error: 'The AI assistant is temporarily unavailable.' },
            { status: 502 },
        );
    }
}
