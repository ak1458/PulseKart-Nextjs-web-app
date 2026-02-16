'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, X, ShoppingCart, ArrowRight } from '@/lib/icons';
import { MENU_DATA } from '@/data/menuData';

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
        const activeData = MENU_DATA.find(c => c.id === activeCategory);
        const hasFeatured = Boolean(activeData?.featured);

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
                                className={`flex items-center gap-1 py-4 font-medium transition-colors text-sm ${activeCategory === cat.id ? 'text-teal-300' : 'text-white hover:text-teal-200'
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
                            className="absolute top-[calc(100%-0.5rem)] left-0 w-[900px] rounded-3xl p-8 z-[60] grid grid-cols-12 gap-8 border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#0b1220]/95 via-[#0b1220]/92 to-[#0b1220]/88 backdrop-blur-2xl"
                            style={{ translateX: '-15%' }} // Center align adjustment
                            onMouseEnter={() => {
                                if (hoverTimeout) clearTimeout(hoverTimeout);
                            }}
                        >
                            {/* Columns */}
                            <div className={`${hasFeatured ? 'col-span-8' : 'col-span-12'} grid grid-cols-2 gap-8`}>
                                {activeData?.columns.map((col, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-70 border-b border-white/5 pb-2">{col.title}</h3>
                                        <ul className="space-y-2">
                                            {col.items.map((item) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => activeData && handleNavigate(activeData.slug, item.slug)}
                                                        className="text-gray-400 hover:text-teal-300 text-sm flex items-center gap-3 group w-full text-left py-1"
                                                        role="menuitem"
                                                    >
                                                        <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-teal-400 transition-all group-hover:scale-150"></span>
                                                        {item.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            {/* Featured Product */}
                            {hasFeatured && activeData?.featured && (
                                <div className="col-span-4 bg-white/5 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="cursor-pointer relative z-10">
                                        <div className="relative overflow-hidden rounded-xl mb-4 bg-black/20">
                                            <img
                                                src={activeData.featured.image}
                                                alt="Featured"
                                                className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {!activeData.featured.inStock && (
                                                <span className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">Out of Stock</span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white mb-1 group-hover:text-teal-300 transition-colors line-clamp-1">
                                            {activeData.featured.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">Best seller this week</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg text-white">
                                                ₹{activeData.featured.price}
                                            </span>
                                            <button className="p-2.5 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition-all hover:scale-110">
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                className="fixed inset-0 z-[100] bg-[#0f172a]/95 backdrop-blur-xl flex flex-col"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={mobileVariants}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center gap-4 pt-10">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full bg-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-gray-500 border border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={closeMenu} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className="mb-6 border-b border-white/5 last:border-0 pb-6">
                            <button
                                onClick={() => toggleMobileCategory(cat.id)}
                                className="w-full flex items-center justify-between py-2 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white/5 text-teal-400'}`}>
                                        <cat.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg transition-colors ${activeCategory === cat.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{cat.name}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${activeCategory === cat.id ? 'rotate-180 text-teal-400' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {activeCategory === cat.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-16 pr-2 pt-4 pb-2 space-y-8">
                                            {cat.columns.map((col, idx) => (
                                                <div key={idx}>
                                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <span className="w-4 h-px bg-gray-700"></span>
                                                        {col.title}
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {col.items.map((item) => (
                                                            <li key={item.id}>
                                                                <button
                                                                    onClick={() => handleNavigate(cat.slug, item.slug)}
                                                                    className="flex items-center justify-between w-full text-gray-400 hover:text-white group/item text-sm font-medium"
                                                                >
                                                                    {item.name}
                                                                    <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover/item:opacity-100 group-hover/item:ml-0 transition-all text-teal-400" />
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


