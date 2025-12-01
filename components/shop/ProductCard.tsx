import { Heart, Plus, Upload } from "lucide-react";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    requiresRx: boolean;
    rating: number;
    reviews: number;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 relative">
            <div className="relative h-48 overflow-hidden bg-slate-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-brand-rose hover:bg-white transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
                {product.requiresRx && (
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Rx Req
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {product.category}
                </div>
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-yellow-400 text-xs">
                        {"★".repeat(Math.floor(product.rating))}
                        {"★".repeat(5 - Math.floor(product.rating)).replace(/★/g, "☆")}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                    </span>
                    <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-sky-500 transition-colors shadow-lg shadow-slate-200">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
