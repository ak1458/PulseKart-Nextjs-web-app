"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart, Minus, Plus, ShoppingCart } from "@/lib/icons";
import { useCart } from "@/context/CartContext";
import { getProductImage } from "@/lib/images";
import { isPrescriptionProduct } from "@/lib/utils";

type Product = {
    id: number;
    title: string;
    description: string;
    category: string;
    price: string;
    mrp: string;
    tax_rate: string;
    stock: number;
    images: string[];
    prescription_required: boolean;
};

export default function ProductDetailClient({ product }: { product: Product }) {
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        // Add to cart qty times (or modify addToCart to accept qty)
        for (let i = 0; i < qty; i++) {
            addToCart({
                id: product.id,
                name: product.title,
                price: parseFloat(product.price),
                image: getProductImage(product.images?.[0]),
                category: product.category,
                requiresPrescription: isPrescriptionProduct(product),
            });
        }
    };

    return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
                    <a href="/" className="hover:text-teal-300 transition-colors">Home</a>
                    <span>/</span>
                    <a href="/shop" className="hover:text-teal-300 transition-colors">{product.category}</a>
                    <span>/</span>
                    <span className="text-white font-bold tracking-wide">{product.title}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 mb-20">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square glass-panel rounded-3xl overflow-hidden border border-white/5 relative flex items-center justify-center p-8 bg-white/5">
                            <img
                                src={getProductImage(product.images?.[0])}
                                alt={product.title}
                                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                            />
                            {product.prescription_required && (
                                <div className="absolute top-4 left-4 bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                    Prescription Required
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 h-fit">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 tracking-tight">{product.title}</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]" />
                                        ))}
                                        <span className="text-gray-400 ml-2 font-medium">(No Reviews Yet)</span>
                                    </div>
                                    <span className="text-gray-600">|</span>
                                    {product.stock > 0 ? (
                                        <span className="text-teal-300 font-bold text-sm bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">In Stock ({product.stock})</span>
                                    ) : (
                                        <span className="text-red-400 font-bold text-sm bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Out of Stock</span>
                                    )}
                                </div>
                            </div>
                            <button className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border-white/10">
                                <Heart className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="text-4xl font-bold text-white mb-8 tracking-tighter">₹{product.price}</div>

                        {product.prescription_required && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 mb-8 flex gap-4">
                                <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-300 text-sm mb-1 uppercase tracking-wider">Prescription Required</h4>
                                    <p className="text-xs text-blue-100 leading-relaxed opacity-80">
                                        This item requires a valid prescription. You can upload it after adding to cart, or consult with our doctors.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Minus className="w-5 h-5" /></button>
                                <span className="w-10 text-center font-bold text-white text-lg">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Plus className="w-5 h-5" /></button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white h-12 rounded-full font-bold hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-6">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-teal-300" />
                                </div>
                                <span>Free delivery by <span className="font-bold text-white">Tomorrow, 4 PM</span></span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                                </div>
                                <span>100% Genuine Medicine</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="glass-panel rounded-3xl p-8 border border-white/5">
                    <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto">
                        {["Description", "Ingredients", "Safety Advice", "Reviews"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`pb-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.toLowerCase() ? "border-teal-400 text-teal-300" : "border-transparent text-gray-500 hover:text-white"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 font-light leading-relaxed">
                        <p>{product.description || "No description available."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



