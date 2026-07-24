'use client';

import { useEffect, useState } from 'react';

/**
 * First-run setup wizard.
 *
 * Written for a pharmacy owner, not an engineer: every field says why it is
 * needed, optional things are marked optional, and failures name the field
 * rather than reporting "an error occurred".
 */

interface PreflightCheck {
    name: string;
    ok: boolean;
    detail: string;
}

type FieldErrors = Record<string, string[] | undefined>;

// GST state codes. Abridged to the ones a retail pharmacy is realistically in;
// the full list lives in src/lib/setup.ts and is validated server-side.
const STATES: [string, string][] = [
    ['27', 'Maharashtra'], ['29', 'Karnataka'], ['33', 'Tamil Nadu'],
    ['07', 'Delhi'], ['24', 'Gujarat'], ['09', 'Uttar Pradesh'],
    ['19', 'West Bengal'], ['36', 'Telangana'], ['32', 'Kerala'],
    ['08', 'Rajasthan'], ['23', 'Madhya Pradesh'], ['03', 'Punjab'],
    ['06', 'Haryana'], ['10', 'Bihar'], ['21', 'Odisha'], ['02', 'Himachal Pradesh'],
    ['04', 'Chandigarh'], ['05', 'Uttarakhand'], ['20', 'Jharkhand'],
    ['22', 'Chhattisgarh'], ['28', 'Andhra Pradesh'], ['30', 'Goa'], ['18', 'Assam'],
];

export default function SetupPage() {
    const [checks, setChecks] = useState<PreflightCheck[] | null>(null);
    const [installed, setInstalled] = useState(false);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [done, setDone] = useState(false);

    const [form, setForm] = useState({
        name: '', gstin: '', drugLicenceNo: '', stateCode: '27',
        addressLine: '', city: '', pincode: '', phone: '', expiryWarnDays: 90,
        outletName: 'Main Counter', invoicePrefix: 'INV',
        ownerName: '', email: '', password: '', pharmacistRegNo: '',
    });

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    useEffect(() => {
        fetch('/api/setup')
            .then((res) => res.json())
            .then((data) => {
                setInstalled(Boolean(data.installed));
                setChecks(data.checks ?? []);
            })
            .catch(() => setError('Could not reach the server.'));
    }, []);

    const blockers = (checks ?? []).filter((c) => !c.ok);

    async function submit() {
        setSubmitting(true);
        setError(null);
        setFieldErrors({});

        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pharmacy: {
                        name: form.name, gstin: form.gstin,
                        drugLicenceNo: form.drugLicenceNo, stateCode: form.stateCode,
                        addressLine: form.addressLine, city: form.city,
                        pincode: form.pincode, phone: form.phone,
                        expiryWarnDays: form.expiryWarnDays,
                    },
                    outlet: { name: form.outletName, invoicePrefix: form.invoicePrefix },
                    owner: {
                        name: form.ownerName, email: form.email,
                        password: form.password, pharmacistRegNo: form.pharmacistRegNo,
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Setup failed.');
                setFieldErrors(data.fieldErrors ?? {});
                return;
            }
            setDone(true);
        } catch {
            setError('Could not reach the server. Is it still running?');
        } finally {
            setSubmitting(false);
        }
    }

    if (installed) {
        return (
            <Shell title="Already set up">
                <p className="text-slate-600">
                    This installation is already configured. Sign in to continue.
                </p>
            </Shell>
        );
    }

    if (done) {
        return (
            <Shell title="You're ready to go">
                <p className="text-slate-600">
                    {form.name} is set up, with <strong>{form.outletName}</strong> as your
                    first counter and an owner account for {form.email}.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                    Next: add your suppliers&apos; stock so batches and expiry dates are on
                    file, then open a shift to start selling.
                </p>
            </Shell>
        );
    }

    if (checks === null) {
        return <Shell title="Checking your setup…"><p className="text-slate-500">One moment.</p></Shell>;
    }

    return (
        <Shell title="Set up your pharmacy" step={step}>
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {step === 0 && (
                <section className="space-y-4">
                    <p className="text-slate-600">
                        A few checks before we begin. Everything must pass.
                    </p>
                    <ul className="space-y-3">
                        {checks.map((check) => (
                            <li key={check.name} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                                <span aria-hidden className={check.ok ? 'text-emerald-600' : 'text-red-600'}>
                                    {check.ok ? '✓' : '✕'}
                                </span>
                                <div>
                                    <p className="font-medium text-slate-900">{check.name}</p>
                                    <p className="text-sm text-slate-500">{check.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Nav
                        onNext={() => setStep(1)}
                        nextDisabled={blockers.length > 0}
                        nextLabel={blockers.length > 0 ? 'Fix the above to continue' : 'Continue'}
                    />
                </section>
            )}

            {step === 1 && (
                <section className="space-y-4">
                    <Field label="Pharmacy name" value={form.name} onChange={(v) => set('name', v)}
                        errors={fieldErrors.name} />
                    <Field label="Drug licence number" value={form.drugLicenceNo}
                        onChange={(v) => set('drugLicenceNo', v)}
                        hint="Printed on every invoice. An invoice without it is not valid."
                        errors={fieldErrors.drugLicenceNo} />
                    <Field label="GSTIN" value={form.gstin} onChange={(v) => set('gstin', v.toUpperCase())}
                        hint="Optional — leave blank if you are not GST registered."
                        errors={fieldErrors.gstin} />
                    <label className="block">
                        <span className="text-sm font-medium text-slate-900">State</span>
                        <span className="block text-xs text-slate-500">
                            Decides whether invoices carry CGST+SGST or IGST.
                        </span>
                        <select value={form.stateCode} onChange={(e) => set('stateCode', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                            {STATES.map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </label>
                    <Field label="Address" value={form.addressLine} onChange={(v) => set('addressLine', v)}
                        errors={fieldErrors.addressLine} />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="City" value={form.city} onChange={(v) => set('city', v)}
                            errors={fieldErrors.city} />
                        <Field label="Pincode" value={form.pincode} onChange={(v) => set('pincode', v)}
                            errors={fieldErrors.pincode} />
                    </div>
                    <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} />
                </section>
            )}

            {step === 2 && (
                <section className="space-y-4">
                    <Field label="Counter name" value={form.outletName}
                        onChange={(v) => set('outletName', v)}
                        hint="What you call this till. You can add more later." />
                    <Field label="Invoice prefix" value={form.invoicePrefix}
                        onChange={(v) => set('invoicePrefix', v.toUpperCase())}
                        hint="Invoice numbers look like INV/2026-27/0001 and restart each financial year."
                        errors={fieldErrors.invoicePrefix} />
                    <label className="block">
                        <span className="text-sm font-medium text-slate-900">Warn me about expiry</span>
                        <span className="block text-xs text-slate-500">
                            How many days ahead stock should start showing as expiring.
                        </span>
                        <select value={form.expiryWarnDays}
                            onChange={(e) => set('expiryWarnDays', Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days (recommended)</option>
                            <option value={180}>180 days</option>
                        </select>
                    </label>
                    <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
                </section>
            )}

            {step === 3 && (
                <section className="space-y-4">
                    <Field label="Your name" value={form.ownerName} onChange={(v) => set('ownerName', v)}
                        errors={fieldErrors.ownerName} />
                    <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)}
                        hint="You will sign in with this." errors={fieldErrors.email} />
                    <Field label="Password" type="password" value={form.password}
                        onChange={(v) => set('password', v)}
                        hint="At least 10 characters. This account can void sales and read the H1 register."
                        errors={fieldErrors.password} />
                    <Field label="Pharmacist registration number" value={form.pharmacistRegNo}
                        onChange={(v) => set('pharmacistRegNo', v)}
                        hint="Optional — required only to dispense Schedule H1 yourself." />
                    <Nav onBack={() => setStep(2)} onNext={submit}
                        nextLabel={submitting ? 'Setting up…' : 'Finish setup'}
                        nextDisabled={submitting} />
                </section>
            )}
        </Shell>
    );
}

function Shell({ title, step, children }: {
    title: string; step?: number; children: React.ReactNode;
}) {
    const labels = ['Checks', 'Pharmacy', 'Counter', 'Your account'];
    return (
        <main className="mx-auto max-w-2xl px-6 py-12">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {step !== undefined && (
                <ol className="mt-4 mb-8 flex gap-2 text-xs">
                    {labels.map((label, i) => (
                        <li key={label}
                            className={`rounded-full px-3 py-1 ${i === step
                                ? 'bg-slate-900 text-white'
                                : i < step ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {label}
                        </li>
                    ))}
                </ol>
            )}
            {children}
        </main>
    );
}

function Field({ label, value, onChange, hint, type = 'text', errors }: {
    label: string; value: string; onChange: (v: string) => void;
    hint?: string; type?: string; errors?: string[];
}) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-slate-900">{label}</span>
            {hint && <span className="block text-xs text-slate-500">{hint}</span>}
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors?.map((message) => (
                <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>
            ))}
        </label>
    );
}

function Nav({ onBack, onNext, nextLabel = 'Continue', nextDisabled }: {
    onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
    return (
        <div className="flex justify-between pt-4">
            {onBack
                ? <button type="button" onClick={onBack}
                    className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">Back</button>
                : <span />}
            <button type="button" onClick={onNext} disabled={nextDisabled}
                className="rounded-lg bg-slate-900 px-5 py-2 text-white disabled:bg-slate-300">
                {nextLabel}
            </button>
        </div>
    );
}
