import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Route protection.
 *
 * The pages already redirect when `/api/me` returns 401, but a client-side
 * redirect is a courtesy, not a control - the markup is still served first.
 * This turns unauthenticated requests away before any till UI is sent.
 *
 * The API routes remain independently guarded by `requireUser`. This is the
 * outer layer, not the enforcement point: middleware runs on the edge runtime
 * and cannot reach the database, so it can verify the token's signature but not
 * that the user still exists or is still active.
 */

const PROTECTED = ['/pos', '/shift'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    const token = request.cookies.get('pos_session')?.value;
    if (!token) return redirectToLogin(request);

    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        // Refuse rather than fail open. A missing secret must not silently
        // become "everyone is allowed in".
        console.error('SESSION_SECRET is missing or too short; refusing all sessions.');
        return redirectToLogin(request);
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(secret));
        return NextResponse.next();
    } catch {
        return redirectToLogin(request);
    }
}

function redirectToLogin(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/pos/:path*', '/shift/:path*'],
};
