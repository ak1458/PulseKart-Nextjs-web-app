'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, ShieldCheck, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    return (
        <footer className="bg-[#115e59] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <img src="/logo.png" alt="PulseKart" className="h-10 w-auto object-contain brightness-0 invert" />
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            Your trusted neighborhood pharmacy, now online. We bring the store to your door with the same care and trust you expect.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#14b8a6] transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#14b8a6] transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#14b8a6] transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-[#2dd4bf] transition-colors">About Us</Link></li>
                            <li><Link href="/shop" className="hover:text-[#2dd4bf] transition-colors">Shop Medicines</Link></li>
                            <li><Link href="#" className="hover:text-[#2dd4bf] transition-colors">Upload Prescription</Link></li>
                            <li><Link href="#" className="hover:text-[#2dd4bf] transition-colors">Health Articles</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="hover:text-[#2dd4bf] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#2dd4bf] transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-[#2dd4bf] transition-colors">Return Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#2dd4bf] transition-colors">Compliance</Link></li>
                        </ul>
                    </div>

                    {/* Disclaimer */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Disclaimer</h4>
                        <p className="text-xs leading-relaxed mb-4">
                            PulseKart is a licensed pharmacy aggregator. All medicines are dispensed by registered pharmacists. Schedule X drugs are not sold online. Prescription verification is mandatory for Schedule H drugs.
                        </p>
                        <div className="border border-teal-800 bg-teal-900/50 p-3 rounded-lg flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-teal-300" />
                            <div>
                                <p className="text-[10px] text-teal-300 font-bold uppercase">Licensed Pharmacy</p>
                                <p className="text-xs text-teal-100 font-mono">Reg: IND/2025/001</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-teal-800 pt-8 text-center text-xs text-teal-200">
                    <p>&copy; 2025 PulseKart India Pvt Ltd. All rights reserved. Made for India.</p>
                </div>
            </div>
        </footer>
    );
}
