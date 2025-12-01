'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, ArrowRight, Package, ShoppingBag, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: 'product' | 'order' | 'user' | 'page';
    id: string;
    title: string;
    subtitle?: string;
    url: string;
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle with Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Fetch Results
    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            try {
                const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
                setSelectedIndex(0);
            } catch (err) {
                console.error('Search failed', err);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Navigation Keys
    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        }
    };

    const handleSelect = (result: SearchResult) => {
        router.push(result.url);
        setIsOpen(false);
        setQuery('');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'product': return <Package className="w-4 h-4" />;
            case 'order': return <ShoppingBag className="w-4 h-4" />;
            case 'user': return <User className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <>
            {/* Trigger Button (Visible in Sidebar/Header) */}
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 text-slate-400 rounded-lg text-sm hover:bg-slate-800 hover:text-white transition-colors w-full mb-4 border border-white/5"
            >
                <Search className="w-4 h-4" />
                <span>Search...</span>
                <kbd className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">⌘K</kbd>
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
                        >
                            {/* Input Header */}
                            <div className="flex items-center p-4 border-b border-gray-100">
                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="Search orders, products, customers..."
                                    className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-900"
                                />
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Results List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {results.length === 0 && query.length > 1 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No results found for "{query}"
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="p-4 text-xs text-gray-400 uppercase font-medium tracking-wider">
                                        Recent Searches
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {results.map((result, index) => (
                                            <button
                                                key={result.id + index}
                                                onClick={() => handleSelect(result)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${index === selectedIndex ? 'bg-teal-50 text-teal-900' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {getIcon(result.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{result.title}</div>
                                                    {result.subtitle && (
                                                        <div className={`text-xs ${index === selectedIndex ? 'text-teal-600/80' : 'text-gray-400'}`}>
                                                            {result.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                                {index === selectedIndex && (
                                                    <ArrowRight className="w-4 h-4 text-teal-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <div className="flex gap-4">
                                    <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">↵</kbd> to select</span>
                                    <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">↑↓</kbd> to navigate</span>
                                    <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-200">esc</kbd> to close</span>
                                </div>
                                <span>PulseKart Search</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
