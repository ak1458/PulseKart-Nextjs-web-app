import React from 'react';
import { ShieldCheck, Users, Clock, MapPin } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-[#134e4a] mb-4">About PulseKart</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    We are Lucknow's most trusted neighborhood pharmacy, now online. Bringing hospital-grade care to your doorstep.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                {[
                    { label: "Happy Families", value: "5000+", icon: Users },
                    { label: "Medicines Delivered", value: "10k+", icon: ShieldCheck },
                    { label: "Years of Service", value: "15+", icon: Clock },
                    { label: "Locations", value: "Lucknow", icon: MapPin },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-teal-50 text-[#14b8a6] rounded-full flex items-center justify-center mx-auto mb-4">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Story */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                        PulseKart started as a small medical store in Gomti Nagar, Lucknow. Over the last 15 years, we have built a reputation for trust, authenticity, and care. We realized that while technology was advancing, the personal touch in healthcare was fading.
                    </p>
                    <p>
                        That's why we launched PulseKart Online. To combine the convenience of modern e-commerce with the trust of your local pharmacist. Every order you place is verified by a certified pharmacist, packed with care, and delivered by our own fleet to ensure safety.
                    </p>
                    <p>
                        We are not just an app; we are your partners in health.
                    </p>
                </div>
            </div>
        </div>
    );
}
