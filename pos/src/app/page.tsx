import { redirect } from 'next/navigation';
import { isInstalled } from '@/lib/setup';

/**
 * Entry point.
 *
 * An unconfigured installation sends the owner straight to the wizard rather
 * than showing a broken dashboard and leaving them to find /setup themselves.
 */
export default async function HomePage() {
    if (!(await isInstalled())) {
        redirect('/setup');
    }

    // The selling screen is not built yet - see "What is and isn't built" in
    // README.md. Sending people to /setup would be a lie now that setup is done.
    return (
        <main className="mx-auto max-w-2xl px-6 py-12">
            <h1 className="text-2xl font-semibold">PulseKart POS</h1>
            <p className="mt-4 text-slate-600">
                Setup is complete. The selling screen is not built yet; the domain
                logic behind it is in <code>src/domain</code> and is covered by tests.
            </p>
        </main>
    );
}
