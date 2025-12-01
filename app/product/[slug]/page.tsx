"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart, Minus, Plus, ShoppingCart, Share2 } from "lucide-react";

export default function ProductPage({ params }: { params: { slug: string } }) {
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("description");

    return (
        <div className="pt-32 pb-20 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <a href="/" className="hover:text-sky-600">Home</a>
                    <span>/</span>
                    <a href="/shop" className="hover:text-sky-600">Medicines</a>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">Amoxicillin 500mg</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 mb-20">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative">
                            <img src="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=800" alt="Product" className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                Prescription Required
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-sky-500 transition-colors">
                                    <img src="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=800" alt="Thumbnail" className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">Amoxicillin 500mg Capsules</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-slate-400 ml-1">(128 Reviews)</span>
                                    </div>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sky-600 font-bold text-sm">In Stock</span>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-3xl font-bold text-slate-900 mb-6">$18.00</div>

                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-8">
                            <div className="flex gap-3">
                                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">Prescription Required</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        This item requires a valid prescription. You can upload it after adding to cart, or consult with our doctors.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center border border-slate-200 rounded-full">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900"><Minus className="w-4 h-4" /></button>
                                <span className="w-8 text-center font-bold text-slate-900">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                            </div>
                            <button className="flex-1 bg-slate-900 text-white h-12 rounded-full font-bold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Truck className="w-5 h-5 text-slate-400" />
                                <span>Free delivery by <span className="font-bold text-slate-900">Tomorrow, 4 PM</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <ShieldCheck className="w-5 h-5 text-slate-400" />
                                <span>100% Genuine Medicine</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-slate-200 pt-12">
                    <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto">
                        {["Description", "Ingredients", "Safety Advice", "Reviews"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? "border-sky-500 text-sky-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Amoxicillin is a penicillin antibiotic that fights bacteria. It is used to treat many different types of infection caused by bacteria, such as tonsillitis, bronchitis, pneumonia, and infections of the ear, nose, throat, skin, or urinary tract.</p>
                        <p>Amoxicillin is also sometimes used together with another antibiotic called clarithromycin (Biaxin) to treat stomach ulcers caused by Helicobacter pylori infection. This combination is sometimes used with a stomach acid reducer called lansoprazole (Prevacid).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
