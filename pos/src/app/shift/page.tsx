'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CASH_DENOMINATIONS, totalDenominations, type DenominationCount } from '@/domain/shift';

/**
 * Shift close.
 *
 * The drawer is counted denomination by denomination rather than as one typed
 * total: it is what makes the count auditable, and it catches the transposition
 * errors a single number hides. The expected figure is deliberately not shown
 * until the count is entered - showing it first invites the counter to type the
 * expected number rather than count.
 */

interface Summary {
    byMode: Record<string, number>;
    salesTotal: number;
    saleCount: number;
    voidedCount: number;
    expectedCash: number;
}

export default function ShiftPage() {
    const router = useRouter();
    const [outletId, setOutletId] = useState('');
    const [shiftId, setShiftId] = useState<string | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [counts, setCounts] = useState<DenominationCount>({});
    const [note, setNote] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [closed, setClosed] = useState<{ variance: number; expected: number; counted: number } | null>(null);

    useEffect(() => {
        fetch('/api/me')
            .then(res => (res.ok ? res.json() : Promise.reject(new Error('unauthorized'))))
            .then(data => setOutletId(data.outlets[0]?.id ?? ''))
            .catch(() => router.push('/login'));
    }, [router]);

    const load = useCallback(async () => {
        if (!outletId) return;
        const res = await fetch(`/api/shifts?outletId=${outletId}`);
        if (!res.ok) return;
        const data = await res.json();
        setShiftId(data.shift?.id ?? null);
        setSummary(data.summary ?? null);
    }, [outletId]);

    useEffect(() => { void load(); }, [load]);

    const countedCash = totalDenominations(counts);

    async function close() {
        if (!shiftId) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/shifts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftId, countedCash, note: note || undefined }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Could not close the shift.'); return; }
            setClosed({ variance: data.variance, expected: data.expectedCash, counted: data.countedCash });
        } finally {
            setBusy(false);
        }
    }

    if (closed) {
        return (
            <main className="mx-auto max-w-md px-6 py-16">
                <h1 className="text-xl font-semibold">Shift closed</h1>
                <dl className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between"><dt>Expected</dt><dd>₹{closed.expected.toFixed(2)}</dd></div>
                    <div className="flex justify-between"><dt>Counted</dt><dd>₹{closed.counted.toFixed(2)}</dd></div>
                    <div className={`flex justify-between font-semibold ${
                        closed.variance === 0 ? 'text-emerald-700'
                            : closed.variance < 0 ? 'text-red-700' : 'text-amber-700'
                    }`}>
                        <dt>{closed.variance === 0 ? 'Balanced' : closed.variance < 0 ? 'Short' : 'Over'}</dt>
                        <dd>₹{Math.abs(closed.variance).toFixed(2)}</dd>
                    </div>
                </dl>
                <a href="/pos" className="mt-8 block text-sm underline">Back to the counter</a>
            </main>
        );
    }

    if (!shiftId) {
        return (
            <main className="mx-auto max-w-md px-6 py-16">
                <h1 className="text-xl font-semibold">No open shift</h1>
                <a href="/pos" className="mt-4 block text-sm underline">Back to the counter</a>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-md px-6 py-12">
            <h1 className="text-xl font-semibold">Close the shift</h1>
            <p className="mt-1 text-sm text-slate-500">Count the drawer note by note.</p>

            {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </p>
            )}

            <div className="mt-6 space-y-2">
                {CASH_DENOMINATIONS.map(denom => (
                    <label key={denom} className="flex items-center gap-3">
                        <span className="w-16 text-right text-sm text-slate-600">₹{denom}</span>
                        <input
                            type="number" min="0" step="1" value={counts[denom] ?? ''}
                            onChange={e => setCounts({ ...counts, [denom]: Number(e.target.value) })}
                            className="w-24 rounded border border-slate-300 px-2 py-1"
                        />
                        <span className="text-sm text-slate-400">
                            = ₹{(denom * (counts[denom] ?? 0)).toFixed(0)}
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-200 pt-4 font-semibold">
                <span>Counted</span>
                <span>₹{countedCash.toFixed(2)}</span>
            </div>

            {summary && (
                revealed ? (
                    <dl className="mt-4 space-y-1 rounded-lg bg-slate-50 p-4 text-sm">
                        <div className="flex justify-between"><dt>Cash sales</dt><dd>₹{(summary.byMode.cash ?? 0).toFixed(2)}</dd></div>
                        <div className="flex justify-between"><dt>Expected in drawer</dt><dd>₹{summary.expectedCash.toFixed(2)}</dd></div>
                        <div className="flex justify-between font-semibold">
                            <dt>Difference</dt>
                            <dd>₹{(countedCash - summary.expectedCash).toFixed(2)}</dd>
                        </div>
                        <p className="pt-2 text-xs text-slate-500">
                            {summary.saleCount} sales
                            {summary.voidedCount > 0 && `, ${summary.voidedCount} voided`}.
                            Card and UPI settle to the bank and are not in the drawer.
                        </p>
                    </dl>
                ) : (
                    <button
                        onClick={() => setRevealed(true)}
                        className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600"
                    >
                        Show expected total
                    </button>
                )
            )}

            <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Note (optional) — explain any difference"
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={2}
            />

            <button
                onClick={close} disabled={busy}
                className="mt-4 w-full rounded-lg bg-slate-900 py-3 font-medium text-white disabled:bg-slate-300"
            >
                {busy ? 'Closing…' : 'Close shift'}
            </button>
        </main>
    );
}
