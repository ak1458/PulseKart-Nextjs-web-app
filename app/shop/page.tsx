'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Filter, Search, ArrowUp, Star, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { Product } from '@/components/ui/ProductCard';

// Categories matching the generator script
const CATEGORIES = ["All Products", "Medicines", "Personal Care", "Health Devices", "Supplements", "Baby Care"];

const PRICE_RANGES = [
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 - ₹1000", min: 500, max: 1000 },
    { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
    { label: "Above ₹2000", min: 2000, max: Infinity },
];

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [activeCategory, setActiveCategory] = useState("All Products");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [minRating, setMinRating] = useState<number>(0);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(12);

    // UI State
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isBrandExpanded, setIsBrandExpanded] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetch('/data/products.json')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load products", err);
                setLoading(false);
            });
    }, []);

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
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Derived Data: Unique Brands
    const uniqueBrands = useMemo(() => {
        const brands = new Set<string>();
        products.forEach(p => {
            if (p.attributes?.brand) brands.add(p.attributes.brand);
        });
        return Array.from(brands).sort();
    }, [products]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Category Filter
            const matchesCategory = activeCategory === "All Products" || p.category === activeCategory;

            // Search Filter
            const matchesSearch = (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase());

            // Price Filter
            let matchesPrice = true;
            if (selectedPriceRanges.length > 0) {
                matchesPrice = selectedPriceRanges.some(rangeLabel => {
                    const range = PRICE_RANGES.find(r => r.label === rangeLabel);
                    if (!range) return false;
                    const price = typeof p.finalPrice === 'number' ? p.finalPrice : parseFloat(p.finalPrice || '0');
                    return price >= range.min && price <= range.max;
                });
            }

            // Brand Filter
            const matchesBrand = selectedBrands.length === 0 || (p.attributes?.brand && selectedBrands.includes(p.attributes.brand));

            // Rating Filter
            const matchesRating = minRating === 0 || (parseFloat(String(p.rating || 0)) >= minRating);

            return matchesCategory && matchesSearch && matchesPrice && matchesBrand && matchesRating;
        });
    }, [products, activeCategory, searchQuery, selectedPriceRanges, selectedBrands, minRating]);

    // Pagination Logic
    const visibleProducts = filteredProducts.slice(0, visibleCount);

    // Handlers
    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setVisibleCount(12); // Reset pagination
        if (cat === "All Products") {
            router.push('/shop');
        } else {
            router.push(`/shop?category=${encodeURIComponent(cat)}`);
        }
    };

    const togglePriceRange = (label: string) => {
        setSelectedPriceRanges(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
        setVisibleCount(12);
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
        setVisibleCount(12);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Shop {activeCategory === "All Products" ? "All" : activeCategory}</h1>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Categories */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Categories
                        </h3>
                        <div className="space-y-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
                                        ? 'bg-teal-50 text-[#14b8a6]'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Price Range</h3>
                        <div className="space-y-2">
                            {PRICE_RANGES.map(range => (
                                <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPriceRanges.includes(range.label) ? 'bg-[#14b8a6] border-[#14b8a6]' : 'border-gray-300 bg-white group-hover:border-[#14b8a6]'
                                        }`}>
                                        {selectedPriceRanges.includes(range.label) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedPriceRanges.includes(range.label)}
                                        onChange={() => togglePriceRange(range.label)}
                                    />
                                    <span className="text-gray-600 text-sm">{range.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Brand Filter */}
                    {uniqueBrands.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Brands</h3>
                            <div className="space-y-2">
                                {uniqueBrands.slice(0, isBrandExpanded ? undefined : 5).map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-[#14b8a6] border-[#14b8a6]' : 'border-gray-300 bg-white group-hover:border-[#14b8a6]'
                                            }`}>
                                            {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => toggleBrand(brand)}
                                        />
                                        <span className="text-gray-600 text-sm">{brand}</span>
                                    </label>
                                ))}
                                {uniqueBrands.length > 5 && (
                                    <button
                                        onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                                        className="text-[#14b8a6] text-sm font-medium flex items-center gap-1 hover:underline mt-2"
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
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Rating</h3>
                        <div className="space-y-2">
                            {[4, 3, 2, 1].map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${minRating === rating ? 'bg-teal-50 ring-1 ring-[#14b8a6]' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">& Up</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No products found matching your criteria.
                                </div>
                            )}

                            {/* Load More Button */}
                            {visibleCount < filteredProducts.length && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 12)}
                                        className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    >
                                        Load More Products
                                    </button>
                                    <p className="text-sm text-gray-500 mt-3">
                                        Showing {visibleCount} of {filteredProducts.length} products
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Back to Top Button */}
            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-24 right-6 p-3 bg-white text-gray-600 border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 hover:text-[#14b8a6] transition-all duration-300 z-40 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
                    }`}
                aria-label="Back to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ShopContent />
        </Suspense>
    );
}
