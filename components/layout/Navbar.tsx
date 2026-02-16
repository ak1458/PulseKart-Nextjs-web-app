'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Menu,
    X,
    Upload,
    User,
    IconCart,
    IconHealth
} from '@/lib/icons';
import { useCart } from '@/context/CartContext';
import MegaMenu from './MegaMenu';
import UploadModal from '@/components/ui/UploadModal';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { cartCount } = useCart();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchOpen]);

    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4">
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            {isMobileMenuOpen && <MegaMenu mode="mobile" closeMenu={() => setIsMobileMenuOpen(false)} />}

            {/* Floating Glass Dock */}
            <div className="glass-dock rounded-2xl md:rounded-full px-6 py-3 transition-all duration-500 ease-out border border-white/10 w-full max-w-7xl">
                <div className="flex items-center justify-between gap-3 sm:gap-6">

                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <img src="/logo.png" alt="PulseKart" className="h-8 w-auto relative z-10 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </Link>

                    {/* Desktop Center Menu - Pills */}
                    <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                        <Link href="/" className="px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 hover:text-teal-300 transition-all duration-300">Home</Link>
                        <MegaMenu mode="desktop" />
                        <Link href="/shop" className="px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 hover:text-teal-300 transition-all duration-300">Shop</Link>
                        <Link href="/health/chat" className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/30 hover:border-teal-400 transition-all duration-300 flex items-center gap-2 group">
                            <IconHealth className="w-4 h-4 icon-glow group-hover:animate-pulse" />
                            AI Health
                        </Link>
                    </div>

                    {/* Right Actions - Icons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Search Trigger */}
                        <button
                            onClick={() => setIsSearchOpen((prev) => !prev)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-button flex items-center justify-center text-gray-300 hover:text-white group shrink-0 ${isSearchOpen ? 'ring-1 ring-teal-500/50 text-teal-300' : ''}`}
                            aria-label="Search"
                            aria-pressed={isSearchOpen}
                        >
                            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Upload Rx Button */}
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full btn-gradient text-white text-xs font-bold animated-border group"
                        >
                            <Upload className="w-3.5 h-3.5 group-hover:animate-bounce" />
                            <span>Upload Rx</span>
                        </button>

                        {/* Cart */}
                        <Link href="/cart" className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-button allow-overflow flex items-center justify-center text-gray-300 group shrink-0">
                            <IconCart className="w-4 h-4 group-hover:text-teal-300 group-hover:scale-110 transition-all" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0b1324] shadow-[0_0_10px_rgba(20,184,166,0.5)]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile */}
                        <Link href="/dashboard" className="hidden sm:flex w-10 h-10 rounded-full glass-button items-center justify-center text-gray-300 overflow-hidden group hover:border-teal-500/50 transition-colors shrink-0">
                            <User className="w-4 h-4 group-hover:text-teal-300 group-hover:scale-110 transition-all" />
                        </Link>

                        {/* Mobile/Tablet Menu (hide on phones; bottom nav handles Shop) */}
                        <button
                            className="hidden md:flex lg:hidden w-10 h-10 rounded-full glass-button items-center justify-center text-white group"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <div ref={searchRef} className="w-full max-w-7xl lg:hidden mt-3">
                    <div className="glass-panel rounded-2xl px-4 py-3 border border-white/10 flex items-center gap-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search medicines, devices, care..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="text-xs text-teal-300 font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

