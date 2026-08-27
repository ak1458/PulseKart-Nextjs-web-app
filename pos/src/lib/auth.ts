import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from './db';

/**
 * Session handling.
 *
 * The session lives in an httpOnly cookie rather than localStorage, so it is
 * not readable by script and cannot be edited from devtools. Role comes out of
 * the signed token on every request; nothing trusts a client-supplied identity.
 */

export type UserRole = 'owner' | 'pharmacist' | 'cashier';

export interface SessionUser {
    id: string;
    pharmacyId: string;
    name: string;
    email: string;
    role: UserRole;
    pharmacistRegNo: string | null;
}

const COOKIE_NAME = 'pos_session';
const SESSION_HOURS = 12;

function secret(): Uint8Array {
    const value = process.env.SESSION_SECRET;
    if (!value || value.length < 32) {
        throw new Error(
            'SESSION_SECRET must be set to at least 32 characters. Generate one with: openssl rand -base64 32',
        );
    }
    return new TextEncoder().encode(value);
}

/**
 * Verify an email and password against the database.
 *
 * Returns null for both "no such user" and "wrong password" so the caller
 * cannot distinguish them and enumerate registered addresses. A bcrypt compare
 * runs even when the user does not exist, so the response time does not leak
 * whether the address is registered either.
 */
export async function verifyCredentials(
    email: string,
    password: string,
): Promise<SessionUser | null> {
    const rows = await query<{
        id: string;
        pharmacy_id: string;
        name: string;
        email: string;
        password_hash: string;
        role: UserRole;
        pharmacist_reg_no: string | null;
        is_active: boolean;
    }>(
        `SELECT id, pharmacy_id, name, email, password_hash, role,
                pharmacist_reg_no, is_active
           FROM users
          WHERE lower(email) = lower($1)
          LIMIT 1`,
        [email.trim()],
    );

    const user = rows[0];

    // A hash of a throwaway value, so the comparison cost is paid either way.
    const hash = user?.password_hash
        ?? '$2b$12$0000000000000000000000000000000000000000000000000000';

    const passwordMatches = await bcrypt.compare(password, hash);

    if (!user || !passwordMatches || !user.is_active) {
        return null;
    }

    return {
        id: user.id,
        pharmacyId: user.pharmacy_id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistRegNo: user.pharmacist_reg_no,
    };
}

export async function createSession(user: SessionUser): Promise<void> {
    const token = await new SignJWT({
        pharmacyId: user.pharmacyId,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacistRegNo: user.pharmacistRegNo,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_HOURS}h`)
        .sign(secret());

    const store = await cookies();
    store.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_HOURS * 60 * 60,
    });
}

export async function destroySession(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE_NAME);
}

/** The signed-in user, or null. Never throws on a bad or expired token. */
export async function getSession(): Promise<SessionUser | null> {
    try {
        const store = await cookies();
        const token = store.get(COOKIE_NAME)?.value;
        if (!token) return null;

        const { payload } = await jwtVerify(token, secret());

        return {
            id: String(payload.sub),
            pharmacyId: String(payload.pharmacyId),
            name: String(payload.name),
            email: String(payload.email),
            role: payload.role as UserRole,
            pharmacistRegNo: (payload.pharmacistRegNo as string | null) ?? null,
        };
    } catch {
        return null;
    }
}

export class UnauthorizedError extends Error {
    constructor(message = 'You need to sign in.') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'You do not have permission to do that.') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/** Require a signed-in user, optionally in one of the given roles. */
export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
    const user = await getSession();
    if (!user) throw new UnauthorizedError();

    if (roles && !roles.includes(user.role)) {
        throw new ForbiddenError(
            `This action is restricted to: ${roles.join(', ')}.`,
        );
    }

    return user;
}
