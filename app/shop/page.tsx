'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, ArrowUp, Star, ChevronDown, ChevronUp, Check, AlertCircle, Loader2, X } from '@/lib/icons';
import ProductCard, { Product } from '@/components/ui/ProductCard';
import { apiUrl } from '@/lib/api';
import { ErrorBoundary } from '@/components/error-boundary';
import { motion, AnimatePresence } from 'framer-motion';

// Categories matching the generator script
const CATEGORIES = ["All Products", "Medicines", "Personal Care", "Health Devices", "Supplements", "Baby Care"];

const PRICE_RANGES = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
    { label: "Above ₹2000", min: 2000, max: Infinity },
];

// Fetch products function
async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(apiUrl('products'));
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid product data format');
    }

    return data.map((p: Record<string, unknown>) => ({
        id: String(p.id || ''),
        title: String(p.title || p.name || ''),
        name: String(p.name || p.title || ''),
        category: String(p.category || ''),
        price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
        mrp: typeof p.mrp === 'string' ? parseFloat(p.mrp) : Number(p.mrp) || undefined,
        finalPrice: typeof p.finalPrice === 'string' ? parseFloat(p.finalPrice) : Number(p.finalPrice) || undefined,
        image: String(p.image || ''),
        images: Array.isArray(p.images) ? p.images.map(String) : undefined,
        description: String(p.description || ''),
        shortDesc: String(p.shortDesc || ''),
        rating: typeof p.rating === 'string' ? parseFloat(p.rating) : Number(p.rating) || undefined,
        reviewCount: Number(p.reviewCount) || undefined,
        isExpress: Boolean(p.isExpress),
        attributes: p.attributes as Record<string, unknown> | undefined,
    }));
}

// Loading skeleton component
function ProductSkeleton() {
    return (
        <div className="h-80 bg-white/5 rounded-2xl animate-pulse border border-white/5">
            <div className="h-48 bg-white/5 rounded-t-2xl" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-white/10 rounded w-1/3" />
                    <div className="h-8 w-8 bg-white/10 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Filter Drawer Component
function FilterDrawer({
    isOpen,
    onClose,
    activeCategory,
    onCategoryChange,
    selectedPriceRanges,
    onTogglePriceRange,
    selectedBrands,
    onToggleBrand,
    minRating,
    onSetRating,
    uniqueBrands,
    onClearAll
}: {
    isOpen: boolean;
    onClose: () => void;
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    selectedPriceRanges: string[];
    onTogglePriceRange: (label: string) => void;
    selectedBrands: string[];
    onToggleBrand: (brand: string) => void;
    minRating: number;
    onSetRating: (rating: number) => void;
    uniqueBrands: string[];
    onClearAll: () => void;
}) {
    const [isBrandExpanded, setIsBrandExpanded] = useState(false);
    const activeFiltersCount = selectedPriceRanges.length + selectedBrands.length + (minRating > 0 ? 1 : 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0b1324] z-50 md:hidden border-l border-white/10 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0b1324]/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                    <Filter className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">Filters</h2>
                                    {activeFiltersCount > 0 && (
                                        <p className="text-xs text-teal-400">{activeFiltersCount} active</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={onClearAll}
                                        className="text-sm text-red-400 font-medium px-3 py-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl glass-button flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Categories */}
                            <div>
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Filter className="w-4 h-4" /> Categories
                                </h3>
                                <div className="space-y-1">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => onCategoryChange(cat)}
                                            className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeCategory === cat
                                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Price Range</h3>
                                <div className="space-y-2">
                                    {PRICE_RANGES.map(range => (
                                        <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPriceRanges.includes(range.label)
                                                ? 'bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                                                : 'border-white/20 bg-white/5 group-hover:border-teal-400'
                                                }`}>
                                                {selectedPriceRanges.includes(range.label) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedPriceRanges.includes(range.label)}
                                                onChange={() => onTogglePriceRange(range.label)}
                                            />
                                            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brand Filter */}
                            {uniqueBrands.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Brands</h3>
                                    <div className="space-y-2">
                                        {uniqueBrands.slice(0, isBrandExpanded ? undefined : 5).map(brand => (
                                            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(brand)
                                                    ? 'bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                                                    : 'border-white/20 bg-white/5 group-hover:border-teal-400'
                                                    }`}>
                                                    {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => onToggleBrand(brand)}
                                                />
                                                <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{brand}</span>
                                            </label>
                                        ))}
                                        {uniqueBrands.length > 5 && (
                                            <button
                                                onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                                                className="text-teal-400 text-sm font-medium flex items-center gap-1 hover:text-teal-300 mt-2 transition-colors"
                                            >
                                                {isBrandExpanded ? (
                                                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                                                ) : (
                                                    <>Show More ({uniqueBrands.length - 5}) <ChevronDown className="w-3 h-3" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rating Filter */}
                            <div>
                                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Rating</h3>
                                <div className="space-y-1">
                                    {[4, 3, 2, 1].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => onSetRating(minRating === rating ? 0 : rating)}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all ${minRating === rating
                                                ? 'bg-white/10 ring-1 ring-teal-500/50'
                                                : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-400 font-medium">& Up</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="sticky bottom-0 bg-[#0b1324] border-t border-white/10 p-4">
                            <button
                                onClick={onClose}
                                className="w-full py-3 btn-gradient text-white font-bold rounded-xl"
                            >
                                Show Results
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Filter State
    const [activeCategory, setActiveCategory] = useState("All Products");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [minRating, setMinRating] = useState<number>(0);

    // UI State
    const [visibleCount, setVisibleCount] = useState(12);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // React Query for data fetching
    const { data: products = [], isLoading, error, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    // Sync URL Category
    useEffect(() => {
        const category = searchParams.get('category');
        if (category && CATEGORIES.includes(category)) {
            setActiveCategory(category);
        } else {
            setActiveCategory("All Products");
        }
    }, [searchParams]);

    // Scroll Listener for Back to Top
    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Derived Data
    const uniqueBrands = useMemo(() => {
        const brands = new Set<string>();
        products.forEach(p => {
            if (p.attributes?.brand) brands.add(String(p.attributes.brand));
        });
        return Array.from(brands).sort();
    }, [products]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === "All Products" || p.category === activeCategory;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                p.title?.toLowerCase().includes(searchLower) ||
                p.name?.toLowerCase().includes(searchLower);
            
            let matchesPrice = true;
            if (selectedPriceRanges.length > 0) {
                const price = p.finalPrice || p.price || 0;
                matchesPrice = selectedPriceRanges.some(rangeLabel => {
                    const range = PRICE_RANGES.find(r => r.label === rangeLabel);
                    if (!range) return false;
                    return price >= range.min && price <= range.max;
                });
            }

            const matchesBrand = selectedBrands.length === 0 ||
                (p.attributes?.brand && selectedBrands.includes(String(p.attributes.brand)));

            const itemRating = typeof p.rating === 'number' ? p.rating : parseFloat(String(p.rating)) || 0;
            const matchesRating = minRating === 0 || itemRating >= minRating;

            return matchesCategory && matchesSearch && matchesPrice && matchesBrand && matchesRating;
        });
    }, [products, activeCategory, searchQuery, selectedPriceRanges, selectedBrands, minRating]);

    const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

    // Handlers
    const handleCategoryChange = useCallback((cat: string) => {
        setActiveCategory(cat);
        setVisibleCount(12);
        if (cat === "All Products") {
            router.push('/shop');
        } else {
            router.push(`/shop?category=${encodeURIComponent(cat)}`);
        }
    }, [router]);

    const togglePriceRange = useCallback((label: string) => {
        setSelectedPriceRanges(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
        setVisibleCount(12);
    }, []);

    const toggleBrand = useCallback((brand: string) => {
        setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
        setVisibleCount(12);
    }, []);

    const clearAllFilters = useCallback(() => {
        setActiveCategory('All Products');
        setSearchQuery('');
        setSelectedPriceRanges([]);
        setSelectedBrands([]);
        setMinRating(0);
        setVisibleCount(12);
        router.push('/shop');
    }, [router]);

    const activeFiltersCount = selectedPriceRanges.length + selectedBrands.length + (minRating > 0 ? 1 : 0);

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16 text-center">
                <div className="glass-panel rounded-2xl p-12 border border-red-500/20">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to load products</h2>
                    <p className="text-gray-400 mb-6">{error instanceof Error ? error.message : 'Something went wrong'}</p>
                    <button onClick={() => refetch()} className="btn-gradient px-6 py-3 rounded-xl text-white font-bold">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16 relative">
            {/* Mobile Filter Drawer */}
            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                selectedPriceRanges={selectedPriceRanges}
                onTogglePriceRange={togglePriceRange}
                selectedBrands={selectedBrands}
                onToggleBrand={toggleBrand}
                minRating={minRating}
                onSetRating={setMinRating}
                uniqueBrands={uniqueBrands}
                onClearAll={clearAllFilters}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Shop {activeCategory === "All Products" ? "All" : activeCategory}
                </h1>

                {/* Search - Desktop */}
                <div className="hidden md:block relative w-80 group">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-gray-400 text-sm transition-all group-hover:bg-white/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5 group-hover:text-teal-300 transition-colors" />
                </div>
            </div>

            {/* Mobile: Search + Filter Button Row */}
            <div className="flex gap-3 mb-4 md:hidden">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-gray-400 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
                <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="px-4 py-3 glass-panel rounded-xl border border-white/10 flex items-center gap-2 text-white font-medium"
                >
                    <Filter className="w-4 h-4" />
                    {activeFiltersCount > 0 && (
                        <span className="w-5 h-5 bg-teal-500 rounded-full text-xs flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile: Quick Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Active Filters Tags (Mobile) */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 md:hidden">
                    {selectedPriceRanges.map(range => (
                        <span key={range} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                            {range}
                            <button onClick={() => togglePriceRange(range)}><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    {selectedBrands.map(brand => (
                        <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                            {brand}
                            <button onClick={() => toggleBrand(brand)}><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    {minRating > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                            {minRating}+ Stars
                            <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Sidebar Filters */}
                <div className="hidden lg:block w-72 flex-shrink-0 space-y-6">
                    {/* Categories */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-wider opacity-80">
                            <Filter className="w-4 h-4" /> Categories
                        </h3>
                        <div className="space-y-1.5">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">Price Range</h3>
                        <div className="space-y-3">
                            {PRICE_RANGES.map(range => (
                                <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPriceRanges.includes(range.label)
                                        ? 'bg-teal-500 border-teal-500'
                                        : 'border-white/20 bg-white/5 group-hover:border-teal-400'
                                        }`}>
                                        {selectedPriceRanges.includes(range.label) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedPriceRanges.includes(range.label)} onChange={() => togglePriceRange(range.label)} />
                                    <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{range.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Brand Filter */}
                    {uniqueBrands.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">Brands</h3>
                            <div className="space-y-3">
                                {uniqueBrands.slice(0, 5).map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(brand)
                                            ? 'bg-teal-500 border-teal-500'
                                            : 'border-white/20 bg-white/5 group-hover:border-teal-400'
                                            }`}>
                                            {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                                        <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => <ProductSkeleton key={n} />)}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 border border-white/5 flex flex-col items-center">
                                    <Search className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="text-lg font-medium text-white mb-2">No products found</p>
                                    <p className="text-sm">Try adjusting your filters or search criteria.</p>
                                    <button onClick={clearAllFilters} className="mt-4 text-teal-400 hover:text-teal-300 font-medium">
                                        Clear all filters
                                    </button>
                                </div>
                            )}

                            {visibleCount < filteredProducts.length && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 12)}
                                        className="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all"
                                    >
                                        Load More Products
                                    </button>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Showing {visibleCount} of {filteredProducts.length} products
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Back to Top - Fixed to viewport, not content */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-28 right-4 md:right-8 md:bottom-8 w-12 h-12 glass-panel bg-[#0b1324]/90 text-white rounded-full shadow-lg border border-white/10 flex items-center justify-center transition-all duration-300 z-40 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                aria-label="Back to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function ShopPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={
                <div className="max-w-7xl mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    </div>
                </div>
            }>
                <ShopContent />
            </Suspense>
        </ErrorBoundary>
    );
}
