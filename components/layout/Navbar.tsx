'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search,
    Menu,
    X,
    ShoppingBag,
    Upload,
    User,
    Mic
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import MegaMenu from './MegaMenu';
import UploadModal from '@/components/ui/UploadModal';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { cartCount } = useCart();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else if (window.scrollY < 10) {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    return (
        <>
            {/* Top Bar - Offers & Updates */}
            <div className={`bg-[#0f766e] text-white text-xs font-medium transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'}`}>
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between sm:justify-center gap-4">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        ⚡ Express Delivery in 45 Minutes (Selected Areas)
                    </span>
                    <span className="hidden sm:inline text-teal-200">|</span>
                    <span className="hidden sm:inline">💊 Flat 15% OFF on First Order with code <span className="font-bold text-yellow-300">NEW15</span></span>
                </div>
            </div>

            <nav
                className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'
                    }`}
            >
                <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
                {isMobileMenuOpen && <MegaMenu mode="mobile" closeMenu={() => setIsMobileMenuOpen(false)} />}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                            <img src="/logo.png" alt="PulseKart" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>

                        {/* Desktop Navigation & Mega Menu */}
                        <div className="hidden lg:flex items-center gap-8">
                            {/* MegaMenu handles its own trigger and dropdown in desktop mode */}
                            <MegaMenu mode="desktop" />

                            <Link href="/shop" className="text-gray-600 hover:text-[#14b8a6] font-medium transition-colors">Shop</Link>
                            <Link href="/health/chat" className="text-gray-600 hover:text-[#14b8a6] font-medium transition-colors flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Health AI
                            </Link>
                            <Link href="/about" className="text-gray-600 hover:text-[#14b8a6] font-medium transition-colors">About</Link>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-auto relative group">
                            <input
                                type="text"
                                placeholder="Search medicines, symptoms..."
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#14b8a6] text-sm transition-all focus:bg-white group-hover:bg-white group-hover:shadow-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 group-hover:text-[#14b8a6] transition-colors" />
                            <Mic className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 cursor-pointer hover:text-[#14b8a6] transition-colors" />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="hidden sm:flex items-center gap-2 text-[#14b8a6] font-bold text-sm bg-teal-50 px-4 py-2.5 rounded-full hover:bg-teal-100 transition-all hover:shadow-md active:scale-95"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="hidden lg:inline">Upload Rx</span>
                            </button>

                            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-[#14b8a6] hover:bg-gray-50 rounded-full transition-colors">
                                <ShoppingBag className="w-6 h-6" />
                                {mounted && cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/dashboard" className="p-2.5 text-gray-600 hover:text-[#14b8a6] hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
                                <User className="w-6 h-6" />
                            </Link>

                            <button
                                className="lg:hidden p-2 text-gray-600"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
