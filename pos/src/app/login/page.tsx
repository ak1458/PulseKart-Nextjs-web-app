'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError((await res.json()).error ?? 'Sign in failed.');
                return;
            }
            router.push('/pos');
            router.refresh();
        } catch {
            setError('Could not reach the server.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">PulseKart POS</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </p>
                )}

                <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                        type="email" value={email} required autoFocus
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Password</span>
                    <input
                        type="password" value={password} required
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                </label>

                <button
                    type="submit" disabled={busy}
                    className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:bg-slate-300"
                >
                    {busy ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </main>
    );
}
