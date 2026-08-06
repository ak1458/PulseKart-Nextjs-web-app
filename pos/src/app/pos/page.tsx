'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * The selling screen.
 *
 * Built for someone standing at a counter with a customer waiting: search is
 * always focused, quantities are editable inline, and anything that will refuse
 * the sale (an expiring batch, a schedule restriction, no open shift) is shown
 * before the operator commits rather than as a failure at the end.
 */

type Schedule = 'otc' | 'h' | 'h1' | 'x';
type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'ok';
type PaymentMode = 'cash' | 'card' | 'upi' | 'credit';

interface Product {
    id: string;
    name: string;
    genericName: string | null;
    manufacturer: string | null;
    schedule: Schedule;
    gstRate: number;
    inStock: number;
    mrp: number;
    nextExpiry: string;
    expiryStatus: ExpiryStatus;
}

interface CartLine extends Product {
    quantity: number;
}

interface Me {
    user: { id: string; name: string; role: string; canDispenseH1: boolean };
    pharmacy: { name: string; state_code: string } | null;
    outlets: { id: string; name: string }[];
}

interface Shift {
    id: string;
    outletName: string;
    openedByName: string;
    openingFloat: number;
}

const EXPIRY_STYLE: Record<ExpiryStatus, string> = {
    expired: 'bg-red-100 text-red-800',
    critical: 'bg-orange-100 text-orange-800',
    warning: 'bg-amber-100 text-amber-800',
    ok: 'bg-slate-100 text-slate-600',
};

const SCHEDULE_LABEL: Record<Schedule, string> = {
    otc: '', h: 'Rx', h1: 'H1', x: 'X',
};

export default function PosPage() {
    const router = useRouter();
    const searchRef = useRef<HTMLInputElement>(null);

    const [me, setMe] = useState<Me | null>(null);
    const [outletId, setOutletId] = useState<string>('');
    const [shift, setShift] = useState<Shift | null>(null);
    const [openingFloat, setOpeningFloat] = useState('0');

    const [term, setTerm] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartLine[]>([]);

    const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
    const [hasPrescription, setHasPrescription] = useState(false);
    const [h1, setH1] = useState({
        patientName: '', prescriberName: '', prescriberAddress: '',
        prescriberRegNo: '', prescriptionRef: '',
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<{ invoiceNo: string; total: number } | null>(null);

    useEffect(() => {
        fetch('/api/me')
            .then(res => (res.ok ? res.json() : Promise.reject(new Error('unauthorized'))))
            .then((data: Me) => {
                setMe(data);
                if (data.outlets[0]) setOutletId(data.outlets[0].id);
            })
            .catch(() => router.push('/login'));
    }, [router]);

    const loadShift = useCallback(async () => {
        if (!outletId) return;
        const res = await fetch(`/api/shifts?outletId=${outletId}`);
        if (res.ok) setShift((await res.json()).shift);
    }, [outletId]);

    useEffect(() => { void loadShift(); }, [loadShift]);

    // Debounced search: a counter types fast and every keystroke firing a query
    // would flood the database and race its own results back out of order.
    useEffect(() => {
        if (term.trim().length < 2 || !outletId) {
            setResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            const res = await fetch(
                `/api/products/search?q=${encodeURIComponent(term)}&outletId=${outletId}`,
            );
            if (!cancelled && res.ok) setResults((await res.json()).products);
        }, 200);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [term, outletId]);

    const needsPrescription = cart.some(l => l.schedule === 'h' || l.schedule === 'h1');
    const needsH1Register = cart.some(l => l.schedule === 'h1');

    const total = cart.reduce((sum, line) => sum + line.mrp * line.quantity, 0);

    function addToCart(product: Product) {
        setError(null);
        setCart(current => {
            const existing = current.find(l => l.id === product.id);
            if (existing) {
                // Never let the line exceed what is actually sellable; the
                // server would refuse it and the operator would learn only at
                // the end of the sale.
                const quantity = Math.min(existing.quantity + 1, product.inStock);
                return current.map(l => (l.id === product.id ? { ...l, quantity } : l));
            }
            return [...current, { ...product, quantity: 1 }];
        });
        setTerm('');
        setResults([]);
        searchRef.current?.focus();
    }

    function setQuantity(id: string, quantity: number) {
        setCart(current => current.flatMap(line => {
            if (line.id !== id) return [line];
            const clamped = Math.min(Math.max(Math.floor(quantity), 0), line.inStock);
            return clamped === 0 ? [] : [{ ...line, quantity: clamped }];
        }));
    }

    async function openShift() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outletId, openingFloat: Number(openingFloat) || 0 }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setShift(data.shift);
        } finally {
            setBusy(false);
        }
    }

    async function completeSale() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Minted here so a retry after a dropped connection cannot
                    // record the same sale twice.
                    clientUuid: crypto.randomUUID(),
                    outletId,
                    lines: cart.map(l => ({ productId: l.id, quantity: l.quantity })),
                    paymentMode,
                    hasPrescription,
                    h1: needsH1Register ? h1 : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'The sale was not recorded.'); return; }

            setReceipt({ invoiceNo: data.invoiceNo, total: data.total });
            setCart([]);
            setHasPrescription(false);
            setH1({ patientName: '', prescriberName: '', prescriberAddress: '', prescriberRegNo: '', prescriptionRef: '' });
            void loadShift();
        } catch {
            setError('Could not reach the server. The sale was not recorded.');
        } finally {
            setBusy(false);
        }
    }

    if (!me) {
        return <main className="p-8 text-slate-500">Loading…</main>;
    }

    if (!shift) {
        return (
            <main className="mx-auto max-w-sm px-6 py-16">
                <h1 className="text-xl font-semibold">Open the counter</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Nothing can be sold until a shift is open — a sale with no shift
                    cannot be reconciled against the drawer.
                </p>

                {error && (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </p>
                )}

                <label className="mt-6 block">
                    <span className="text-sm font-medium">Counter</span>
                    <select
                        value={outletId} onChange={e => setOutletId(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                        {me.outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </label>

                <label className="mt-4 block">
                    <span className="text-sm font-medium">Opening cash in drawer</span>
                    <input
                        type="number" min="0" step="1" value={openingFloat}
                        onChange={e => setOpeningFloat(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                </label>

                <button
                    onClick={openShift} disabled={busy}
                    className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:bg-slate-300"
                >
                    {busy ? 'Opening…' : 'Open shift'}
                </button>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-6 py-8">
            <header className="mb-6 flex items-baseline justify-between">
                <div>
                    <h1 className="text-xl font-semibold">{me.pharmacy?.name ?? 'Counter'}</h1>
                    <p className="text-sm text-slate-500">
                        {shift.outletName} &middot; opened by {shift.openedByName}
                    </p>
                </div>
                <a href="/shift" className="text-sm text-slate-600 underline">Close shift</a>
            </header>

            {receipt && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Recorded <strong>{receipt.invoiceNo}</strong> — ₹{receipt.total.toFixed(2)}.
                    <button onClick={() => setReceipt(null)} className="ml-3 underline">Dismiss</button>
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            <div className="relative">
                <input
                    ref={searchRef} autoFocus value={term}
                    onChange={e => setTerm(e.target.value)}
                    placeholder="Search medicines by name or salt…"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />

                {results.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {results.map(product => (
                            <li key={product.id}>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
                                >
                                    <span>
                                        <span className="font-medium">{product.name}</span>
                                        {SCHEDULE_LABEL[product.schedule] && (
                                            <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                {SCHEDULE_LABEL[product.schedule]}
                                            </span>
                                        )}
                                        <span className="block text-xs text-slate-500">
                                            {product.manufacturer} &middot; {product.inStock} in stock
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-right">
                                        <span className="font-medium">₹{product.mrp.toFixed(2)}</span>
                                        <span className={`mt-1 block rounded px-1.5 py-0.5 text-[10px] ${EXPIRY_STYLE[product.expiryStatus]}`}>
                                            exp {new Date(product.nextExpiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <section className="mt-6 rounded-lg border border-slate-200">
                {cart.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-500">
                        Search above to start a bill.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 w-24">Qty</th>
                                <th className="px-4 py-2 text-right">MRP</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(line => (
                                <tr key={line.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3">
                                        {line.name}
                                        {SCHEDULE_LABEL[line.schedule] && (
                                            <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                {SCHEDULE_LABEL[line.schedule]}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number" min="0" max={line.inStock} value={line.quantity}
                                            onChange={e => setQuantity(line.id, Number(e.target.value))}
                                            className="w-20 rounded border border-slate-300 px-2 py-1"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">₹{line.mrp.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        ₹{(line.mrp * line.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {cart.length > 0 && (
                <section className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm font-medium">Payment</span>
                            <div className="mt-1 flex gap-2">
                                {(['cash', 'card', 'upi', 'credit'] as PaymentMode[]).map(mode => (
                                    <button
                                        key={mode} onClick={() => setPaymentMode(mode)}
                                        className={`flex-1 rounded-lg px-3 py-2 text-sm capitalize ${
                                            paymentMode === mode
                                                ? 'bg-slate-900 text-white'
                                                : 'border border-slate-300'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {needsPrescription && (
                            <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                                <input
                                    type="checkbox" checked={hasPrescription}
                                    onChange={e => setHasPrescription(e.target.checked)}
                                    className="mt-0.5"
                                />
                                <span>
                                    I have seen a valid prescription for the restricted items
                                    in this bill.
                                </span>
                            </label>
                        )}

                        {needsH1Register && !me.user.canDispenseH1 && (
                            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                This bill contains a Schedule H1 medicine. Only a registered
                                pharmacist with a registration number on file can dispense it.
                            </p>
                        )}

                        {needsH1Register && me.user.canDispenseH1 && (
                            <fieldset className="space-y-2 rounded-lg border border-slate-300 p-3">
                                <legend className="px-1 text-xs font-medium text-slate-600">
                                    Schedule H1 register — required by law, retained 3 years
                                </legend>
                                {([
                                    ['patientName', 'Patient name'],
                                    ['prescriberName', "Prescriber's name"],
                                    ['prescriberAddress', "Prescriber's address"],
                                    ['prescriberRegNo', 'Prescriber reg. no (optional)'],
                                    ['prescriptionRef', 'Prescription reference (optional)'],
                                ] as const).map(([field, label]) => (
                                    <input
                                        key={field} placeholder={label} value={h1[field]}
                                        onChange={e => setH1({ ...h1, [field]: e.target.value })}
                                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                                    />
                                ))}
                            </fieldset>
                        )}
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            MRP is inclusive of GST. The exact tax split and rounding are
                            computed by the server and printed on the invoice.
                        </p>

                        <button
                            onClick={completeSale}
                            disabled={busy || (needsPrescription && !hasPrescription)}
                            className="mt-4 w-full rounded-lg bg-slate-900 py-3 font-medium text-white disabled:bg-slate-300"
                        >
                            {busy ? 'Recording…' : 'Complete sale'}
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}
