'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { MENU_DATA, MenuCategory } from '@/data/menuData';

// --- Types ---
type MegaMenuProps = {
    mode: 'desktop' | 'mobile';
    closeMenu?: () => void;
};

// --- Animations ---
const desktopVariants = {
    hidden: { opacity: 0, y: -8, transition: { duration: 0.18 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } }
};

const mobileVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { duration: 0.26 } },
    exit: { y: '100%', transition: { duration: 0.2 } }
};

export default function MegaMenu({ mode, closeMenu }: MegaMenuProps) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Desktop Logic ---
    const handleMouseEnter = (catId: string) => {
        if (mode !== 'desktop') return;
        if (hoverTimeout) clearTimeout(hoverTimeout);

        const timeout = setTimeout(() => {
            setActiveCategory(catId);
            // Prefetch logic would go here
            console.log(`Prefetching data for ${catId}`);
        }, 120);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (mode !== 'desktop') return;
        if (hoverTimeout) clearTimeout(hoverTimeout);

        const timeout = setTimeout(() => {
            setActiveCategory(null);
        }, 300);
        setHoverTimeout(timeout);
    };

    // --- Keyboard Navigation (Desktop) ---
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (mode !== 'desktop' || !activeCategory) return;

        if (e.key === 'Escape') {
            setActiveCategory(null);
            containerRef.current?.focus();
        }
        // Add more complex keyboard nav (arrows) here if needed
    }, [activeCategory, mode]);

    // --- Mobile Logic ---
    const filteredCategories = mode === 'mobile' && searchQuery
        ? MENU_DATA.map(cat => ({
            ...cat,
            columns: cat.columns.map(col => ({
                ...col,
                items: col.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            })).filter(col => col.items.length > 0)
        })).filter(cat => cat.columns.length > 0)
        : MENU_DATA;

    const toggleMobileCategory = (catId: string) => {
        setActiveCategory(activeCategory === catId ? null : catId);
    };

    // --- Navigation ---
    const handleNavigate = (catSlug: string, subSlug: string) => {
        router.push(`/shop?category=${catSlug}&sub=${subSlug}`);
        setActiveCategory(null);
        if (closeMenu) closeMenu();
    };

    // --- Render Desktop ---
    if (mode === 'desktop') {
        return (
            <div
                className="relative"
                onMouseLeave={handleMouseLeave}
                ref={containerRef}
                onKeyDown={handleKeyDown}
            >
                {/* Trigger Links */}
                <div className="flex gap-6">
                    {MENU_DATA.map((cat) => (
                        <div
                            key={cat.id}
                            className="relative"
                            onMouseEnter={() => handleMouseEnter(cat.id)}
                        >
                            <button
                                className={`flex items-center gap-1 py-4 font-medium transition-colors ${activeCategory === cat.id ? 'text-[#14b8a6]' : 'text-gray-600 hover:text-[#14b8a6]'
                                    }`}
                                aria-expanded={activeCategory === cat.id}
                                aria-controls={`menu-${cat.id}`}
                                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                            >
                                {cat.name} <ChevronDown className={`w-3 h-3 transition-transform ${activeCategory === cat.id ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Dropdown Panel */}
                <AnimatePresence>
                    {activeCategory && (
                        <motion.div
                            id={`menu-${activeCategory}`}
                            role="menu"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={desktopVariants}
                            className="absolute top-[calc(100%-1rem)] left-0 w-[800px] bg-white rounded-xl shadow-xl border border-gray-100 p-6 pt-10 z-[60] grid grid-cols-12 gap-8"
                            style={{ translateX: '-20%' }} // Center align adjustment
                            onMouseEnter={() => {
                                if (hoverTimeout) clearTimeout(hoverTimeout);
                            }}
                        >
                            {/* Columns */}
                            <div className="col-span-8 grid grid-cols-2 gap-8">
                                {MENU_DATA.find(c => c.id === activeCategory)?.columns.map((col, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">{col.title}</h3>
                                        <ul className="space-y-3">
                                            {col.items.map((item) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => handleNavigate(MENU_DATA.find(c => c.id === activeCategory)!.slug, item.slug)}
                                                        className="text-gray-600 hover:text-[#14b8a6] text-sm flex items-center gap-2 group w-full text-left"
                                                        role="menuitem"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#14b8a6] transition-colors"></span>
                                                        {item.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Featured Product */}
                            <div className="col-span-4 bg-gray-50 rounded-lg p-4">
                                {MENU_DATA.find(c => c.id === activeCategory)?.featured && (
                                    <div className="group cursor-pointer">
                                        <div className="relative overflow-hidden rounded-lg mb-3">
                                            <img
                                                src={MENU_DATA.find(c => c.id === activeCategory)?.featured?.image}
                                                alt="Featured"
                                                className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {!MENU_DATA.find(c => c.id === activeCategory)?.featured?.inStock && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#14b8a6] transition-colors">
                                            {MENU_DATA.find(c => c.id === activeCategory)?.featured?.name}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg text-gray-900">
                                                ₹{MENU_DATA.find(c => c.id === activeCategory)?.featured?.price}
                                            </span>
                                            <button className="p-2 bg-white rounded-full shadow-sm hover:bg-[#14b8a6] hover:text-white transition-colors">
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // --- Render Mobile ---
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] bg-white flex flex-col"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mobileVariants}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full bg-gray-50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className="mb-4 border-b border-gray-50 last:border-0 pb-4">
                            <button
                                onClick={() => toggleMobileCategory(cat.id)}
                                className="w-full flex items-center justify-between py-2 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#14b8a6] group-hover:bg-[#14b8a6] group-hover:text-white transition-colors">
                                        <cat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{cat.name}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeCategory === cat.id ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {activeCategory === cat.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-14 pr-2 pt-2 pb-4 space-y-6">
                                            {cat.columns.map((col, idx) => (
                                                <div key={idx}>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{col.title}</h4>
                                                    <ul className="space-y-3">
                                                        {col.items.map((item) => (
                                                            <li key={item.id}>
                                                                <button
                                                                    onClick={() => handleNavigate(cat.slug, item.slug)}
                                                                    className="flex items-center justify-between w-full text-gray-600 hover:text-[#14b8a6]"
                                                                >
                                                                    {item.name}
                                                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
