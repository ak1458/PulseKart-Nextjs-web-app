'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mail, Phone, MapPin, ArrowUpRight } from '@/lib/icons';

export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    const socialLinks = [
        {
            name: 'Facebook',
            href: '#',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.07h3.128V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.919.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.636h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
                </svg>
            ),
        },
        {
            name: 'Instagram',
            href: '#',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
            ),
        },
        {
            name: 'YouTube',
            href: '#',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="relative border-t border-white/5 pt-8 pb-28 md:pt-16 md:pb-12 overflow-hidden">
            {/* Mobile Minimal Footer */}
            <div className="md:hidden px-4">
                <div className="flex items-center gap-3 mb-4">
                    <img src="/logo.png" alt="PulseKart" className="h-6 w-auto object-contain brightness-0 invert" />
                    <span className="text-sm font-semibold text-white">PulseKart</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 font-medium mb-5">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Explore</p>
                        {['Shop Medicines', 'AI Consultation', 'Upload Rx', 'Lab Tests'].map((link, i) => (
                            <Link
                                key={i}
                                href={`/${link.toLowerCase().replace(' ', '-')}`}
                                className="block hover:text-teal-300 transition-colors"
                            >
                                {link}
                            </Link>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Support</p>
                        {['Help Center', 'Track Order', 'Returns', 'Contact Us'].map((link, i) => (
                            <Link
                                key={i}
                                href={`/${link.toLowerCase().replace(' ', '-')}`}
                                className="block hover:text-teal-300 transition-colors"
                            >
                                {link}
                            </Link>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Legal</p>
                        {['About', 'Privacy', 'Terms'].map((link, i) => (
                            <Link
                                key={i}
                                href={`/${link.toLowerCase()}`}
                                className="block hover:text-teal-300 transition-colors"
                            >
                                {link}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center text-teal-300 border border-teal-500/30">
                            <ShieldCheck className="w-5 h-5 icon-glow" />
                        </div>
                        <div>
                            <p className="text-xs text-teal-300 font-bold">Verified Licensed</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                                ID: IND/PHARMA/{new Date().getFullYear()}/PK001
                            </p>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Fully licensed pharmaceutical aggregator operating under CDSCO guidelines.
                    </p>
                </div>
                <div className="flex gap-3 mt-5">
                    {socialLinks.map((social, i) => (
                        <a key={i} href={social.href} className="w-9 h-9 rounded-xl glass-button flex items-center justify-center text-gray-400 hover:text-teal-300 transition-all duration-300">
                            {social.icon}
                        </a>
                    ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-5">&copy; {new Date().getFullYear()} PulseKart India Pvt Ltd.</p>
            </div>

            {/* Animated Background Glow */}
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none hidden md:block" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none hidden md:block" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 hidden md:block">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="md:col-span-4">
                        <Link href="/" className="flex items-center space-x-3 mb-6 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                                <img src="/logo.png" alt="PulseKart" className="h-10 w-auto object-contain brightness-0 invert relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-8 font-light max-w-xs">
                            The future of healthcare delivery. Seamless ordering, secure payments, and verified medicines.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, i) => (
                                <a key={i} href={social.href} className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-gray-400 hover:text-teal-300 hover:border-teal-500/30 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all duration-300">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-70">Explore</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            {['Shop Medicines', 'AI Consultation', 'Upload Rx', 'Lab Tests'].map((link, i) => (
                                <li key={i}>
                                    <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-teal-300 transition-colors flex items-center gap-2 group">
                                        <span className="w-0 group-hover:w-3 h-px bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"></span>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-70">Support</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            {['Help Center', 'Track Order', 'Returns', 'Contact Us'].map((link, i) => (
                                <li key={i}>
                                    <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-teal-300 transition-colors flex items-center gap-2 group">
                                        <span className="w-0 group-hover:w-3 h-px bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"></span>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Credentials */}
                    <div className="md:col-span-4">
                        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-70">Credentials</h4>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 animated-border">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center text-teal-300 border border-teal-500/30">
                                    <ShieldCheck className="w-6 h-6 icon-glow" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-300 font-bold">Verified Licensed</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                                ID: IND/PHARMA/{new Date().getFullYear()}/PK001
                            </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Fully licensed pharmaceutical aggregator operating under CDSCO guidelines. All medicines verified for authenticity.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
                    <p>&copy; {new Date().getFullYear()} PulseKart India Pvt Ltd. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1">Made by Smile Fotilo</span>
                        <span className="text-teal-400/60 font-mono">v3.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

