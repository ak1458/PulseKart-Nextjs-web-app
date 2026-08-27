import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, transaction, getPool } from './db';
import { isValidGstin, stateCodeFromGstin } from '@/domain/gst';

/**
 * First-run installation.
 *
 * The target user is a pharmacy owner, not an engineer. They should not have to
 * run migrations, seed an admin row, or edit config files by hand — so this
 * applies the schema and creates the first account from a web form, the way
 * WordPress does. Everything it needs beyond the database URL is asked for on
 * screen.
 */

/** Indian GST state codes, used to validate what the owner enters. */
const STATE_CODES = new Set([
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
    '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
    '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36',
    '37', '38', '97', '99',
]);

export const setupSchema = z.object({
    pharmacy: z.object({
        name: z.string().min(2, 'Pharmacy name is required'),
        // Optional: below the registration threshold a pharmacy has no GSTIN,
        // and demanding one would block a legitimate small shop from installing.
        gstin: z.string().optional().or(z.literal('')),
        drugLicenceNo: z.string().min(3, 'Drug licence number is required'),
        stateCode: z.string().length(2, 'Select your state'),
        addressLine: z.string().min(5, 'Address is required'),
        city: z.string().min(2, 'City is required'),
        pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
        phone: z.string().optional().or(z.literal('')),
        expiryWarnDays: z.coerce.number().int().min(7).max(365).default(90),
    }),
    outlet: z.object({
        name: z.string().min(2, 'Counter name is required').default('Main Counter'),
        invoicePrefix: z
            .string()
            .min(1)
            .max(6)
            .regex(/^[A-Z0-9-]+$/, 'Use capital letters, digits or hyphens only')
            .default('INV'),
    }),
    owner: z.object({
        name: z.string().min(2, 'Your name is required'),
        email: z.string().email('Enter a valid email address'),
        // 10, not 8. This account can void sales and read the H1 register.
        password: z.string().min(10, 'Use at least 10 characters'),
        pharmacistRegNo: z.string().optional().or(z.literal('')),
    }),
});

export type SetupInput = z.infer<typeof setupSchema>;

/**
 * Has the wizard already run?
 *
 * Returns false when the schema is absent, which is the normal state before a
 * first install.
 */
export async function isInstalled(): Promise<boolean> {
    try {
        const rows = await query<{ completed_at: Date | null }>(
            'SELECT completed_at FROM install_state LIMIT 1',
        );
        return rows.length > 0 && rows[0].completed_at !== null;
    } catch {
        // Relation does not exist yet.
        return false;
    }
}

/**
 * Apply every migration in order.
 *
 * Each file runs in its own transaction so a failure halfway through leaves the
 * database on the last complete migration rather than in a partial state.
 * Migrations are expected to be idempotent-safe to attempt: applying an already
 * applied one raises and is reported rather than silently swallowed.
 */
export async function runMigrations(): Promise<{ applied: string[] }> {
    const dir = path.join(process.cwd(), 'migrations');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

    const applied: string[] = [];
    for (const file of files) {
        const sql = await readFile(path.join(dir, file), 'utf8');
        await transaction(async (client) => {
            await client.query(sql);
        });
        applied.push(file);
    }
    return { applied };
}

export class SetupAlreadyCompletedError extends Error {
    constructor() {
        super('Setup has already been completed.');
        this.name = 'SetupAlreadyCompletedError';
    }
}

export interface SetupResult {
    pharmacyId: string;
    outletId: string;
    ownerId: string;
}

/**
 * Create the pharmacy, its first counter and the owner account.
 *
 * Guarded by `install_state.completed_at`, checked and set inside the same
 * transaction: without that, two concurrent submissions of the form would each
 * see "not installed" and create a second owner on someone else's pharmacy.
 */
export async function install(input: SetupInput): Promise<SetupResult> {
    if (await isInstalled()) {
        throw new SetupAlreadyCompletedError();
    }

    const { pharmacy, outlet, owner } = input;

    const gstin = pharmacy.gstin?.trim().toUpperCase() || null;
    if (gstin && !isValidGstin(gstin)) {
        throw new Error('That GSTIN does not look right. Check it, or leave it blank.');
    }

    // A GSTIN embeds the state, and the two disagreeing would silently produce
    // wrong CGST/SGST-vs-IGST decisions on every invoice.
    const gstinState = stateCodeFromGstin(gstin);
    const stateCode = gstinState ?? pharmacy.stateCode;
    if (gstinState && gstinState !== pharmacy.stateCode) {
        throw new Error(
            `Your GSTIN begins with ${gstinState}, which is a different state from the one selected.`,
        );
    }
    if (!STATE_CODES.has(stateCode)) {
        throw new Error('Select a valid state.');
    }

    const passwordHash = await bcrypt.hash(owner.password, 12);

    return transaction(async (client) => {
        // Re-check inside the transaction and lock the row.
        const state = await client.query<{ completed_at: Date | null }>(
            'SELECT completed_at FROM install_state FOR UPDATE',
        );
        if (state.rows[0]?.completed_at !== null) {
            throw new SetupAlreadyCompletedError();
        }

        const pharmacyRow = await client.query<{ id: string }>(
            `INSERT INTO pharmacies
                (name, gstin, drug_licence_no, state_code, address_line, city,
                 pincode, phone, expiry_warn_days)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
                pharmacy.name.trim(),
                gstin,
                pharmacy.drugLicenceNo.trim(),
                stateCode,
                pharmacy.addressLine.trim(),
                pharmacy.city.trim(),
                pharmacy.pincode,
                pharmacy.phone?.trim() || null,
                pharmacy.expiryWarnDays,
            ],
        );
        const pharmacyId = pharmacyRow.rows[0].id;

        const outletRow = await client.query<{ id: string }>(
            `INSERT INTO outlets (pharmacy_id, name, invoice_prefix)
             VALUES ($1, $2, $3) RETURNING id`,
            [pharmacyId, outlet.name.trim(), outlet.invoicePrefix.trim().toUpperCase()],
        );

        const ownerRow = await client.query<{ id: string }>(
            `INSERT INTO users
                (pharmacy_id, name, email, password_hash, role, pharmacist_reg_no)
             VALUES ($1, $2, $3, $4, 'owner', $5)
             RETURNING id`,
            [
                pharmacyId,
                owner.name.trim(),
                owner.email.trim().toLowerCase(),
                passwordHash,
                owner.pharmacistRegNo?.trim() || null,
            ],
        );

        await client.query(
            'UPDATE install_state SET completed_at = NOW() WHERE id = TRUE',
        );

        return {
            pharmacyId,
            outletId: outletRow.rows[0].id,
            ownerId: ownerRow.rows[0].id,
        };
    });
}

/**
 * Pre-flight checks shown on the wizard's first screen.
 *
 * Reports every problem at once. Surfacing them one at a time turns a five
 * minute install into five rounds of trial and error.
 */
export interface PreflightCheck {
    name: string;
    ok: boolean;
    detail: string;
}

export async function preflight(): Promise<PreflightCheck[]> {
    const checks: PreflightCheck[] = [];

    const hasUrl = Boolean(process.env.DATABASE_URL);
    checks.push({
        name: 'Database URL configured',
        ok: hasUrl,
        detail: hasUrl
            ? 'DATABASE_URL is set.'
            : 'DATABASE_URL is missing. Copy .env.example to .env and set it.',
    });

    if (hasUrl) {
        try {
            await query('SELECT 1');
            checks.push({
                name: 'Database reachable',
                ok: true,
                detail: 'Connected successfully.',
            });
        } catch (error) {
            checks.push({
                name: 'Database reachable',
                ok: false,
                detail: error instanceof Error ? error.message : 'Could not connect.',
            });
        }

        try {
            const rows = await query<{ version: string }>('SHOW server_version');
            const major = parseInt(rows[0]?.version ?? '0', 10);
            checks.push({
                name: 'PostgreSQL 13 or newer',
                ok: major >= 13,
                detail: `Found PostgreSQL ${rows[0]?.version ?? 'unknown'}.`,
            });
        } catch {
            checks.push({
                name: 'PostgreSQL 13 or newer',
                ok: false,
                detail: 'Could not read the server version.',
            });
        }
    }

    const hasSecret = (process.env.SESSION_SECRET ?? '').length >= 32;
    checks.push({
        name: 'Session secret set',
        ok: hasSecret,
        detail: hasSecret
            ? 'SESSION_SECRET is set.'
            : 'SESSION_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32',
    });

    return checks;
}

/** Close the pool. Used by scripts so the process can exit. */
export async function closePool(): Promise<void> {
    await getPool().end();
}
