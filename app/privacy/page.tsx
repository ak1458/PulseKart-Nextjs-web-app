import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-emerald max-w-none space-y-8 text-gray-600">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, place an order, upload a prescription, or contact customer support. This may include your name, email address, phone number, delivery address, and payment information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Process and deliver your orders.</li>
                        <li>Verify prescriptions with certified pharmacists.</li>
                        <li>Send you order updates and transactional messages.</li>
                        <li>Improve our services and website experience.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your health data is treated with the utmost confidentiality.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@pulsekart.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
