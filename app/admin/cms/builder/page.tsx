'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Layout, Image as ImageIcon, Type, ShoppingBag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Block {
    id: string;
    type: 'hero' | 'text' | 'product_grid';
    content: any;
}

export default function PageBuilder() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const [pageData, setPageData] = useState({ slug: '', title: '', description: '' });
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchPage(slug);
        }
    }, [slug]);

    const fetchPage = async (slug: string) => {
        try {
            const res = await fetch(`/api/v1/cms/pages/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setPageData({ slug: data.slug, title: data.title, description: data.description });
                setBlocks(data.blocks.map((b: any) => ({
                    id: b.id.toString(),
                    type: b.type,
                    content: b.content
                })));
            }
        } catch (error) {
            console.error('Failed to load page', error);
        }
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            content: type === 'hero' ? { title: 'New Hero', subtitle: 'Subtitle', cta: 'Shop Now' } :
                type === 'text' ? { text: 'Enter your text here...' } :
                    { category: 'all', limit: 4 }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!pageData.slug || !pageData.title) return alert('Title and Slug are required');
        setLoading(true);
        try {
            const payload = {
                ...pageData,
                blocks: blocks.map((b, i) => ({
                    type: b.type,
                    position: i,
                    content: b.content
                }))
            };

            const res = await fetch('/api/v1/cms/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Page saved successfully!');
                router.push('/admin/cms');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            alert('Error saving page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6">
            {/* Left Panel: Preview / Canvas */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-bold text-gray-900">Page Settings</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Page Title</label>
                            <input
                                type="text"
                                value={pageData.title}
                                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="e.g. Summer Sale"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">URL Slug</label>
                            <input
                                type="text"
                                value={pageData.slug}
                                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="e.g. summer-sale-2025"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm group relative">
                            <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-gray-100 rounded"><ArrowUp className="w-4 h-4 text-gray-500" /></button>
                                <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-gray-100 rounded"><ArrowDown className="w-4 h-4 text-gray-500" /></button>
                                <button onClick={() => removeBlock(index)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>

                            <div className="flex items-center gap-2 mb-4 text-teal-600 font-medium text-sm uppercase tracking-wider">
                                {block.type === 'hero' && <ImageIcon className="w-4 h-4" />}
                                {block.type === 'text' && <Type className="w-4 h-4" />}
                                {block.type === 'product_grid' && <ShoppingBag className="w-4 h-4" />}
                                {block.type.replace('_', ' ')} Block
                            </div>

                            {/* Block Editors */}
                            {block.type === 'hero' && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={block.content.title}
                                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded text-lg font-bold"
                                        placeholder="Hero Title"
                                    />
                                    <input
                                        type="text"
                                        value={block.content.subtitle}
                                        onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded text-sm"
                                        placeholder="Subtitle"
                                    />
                                </div>
                            )}

                            {block.type === 'text' && (
                                <textarea
                                    value={block.content.text}
                                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded h-24 text-sm"
                                    placeholder="Enter content..."
                                />
                            )}
                        </div>
                    ))}

                    {blocks.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                            Add blocks to start building
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Toolbox */}
            <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col gap-6">
                <div>
                    <h3 className="font-bold text-gray-900 mb-4">Add Blocks</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => addBlock('hero')} className="p-4 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-center flex flex-col items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Hero Banner</span>
                        </button>
                        <button onClick={() => addBlock('text')} className="p-4 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-center flex flex-col items-center gap-2">
                            <Type className="w-6 h-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Text Block</span>
                        </button>
                        <button onClick={() => addBlock('product_grid')} className="p-4 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-center flex flex-col items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Product Grid</span>
                        </button>
                    </div>
                </div>

                <div className="mt-auto">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Page
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
