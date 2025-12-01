import { Check } from "lucide-react";

export default function FilterSidebar() {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
                <div className="space-y-2">
                    {["All Products", "Medicines", "Vitamins & Supplements", "Personal Care", "First Aid", "Devices"].map((cat, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${i === 0 ? "bg-sky-500 border-sky-500 text-white" : "border-slate-200 group-hover:border-sky-500"}`}>
                                {i === 0 && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${i === 0 ? "font-bold text-slate-900" : "text-slate-600 group-hover:text-sky-600"}`}>
                                {cat}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-slate-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                            <span className="text-xs text-slate-400 block">Min</span>
                            <span className="text-sm font-bold text-slate-900">$0</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                            <span className="text-xs text-slate-400 block">Max</span>
                            <span className="text-sm font-bold text-slate-900">$500</span>
                        </div>
                    </div>
                    <input type="range" className="w-full accent-sky-500" />
                </div>
            </div>

            <div>
                <h3 className="font-bold text-slate-900 mb-4">Prescription</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-md border border-slate-200 group-hover:border-sky-500 flex items-center justify-center"></div>
                        <span className="text-sm text-slate-600 group-hover:text-sky-600">Requires Rx</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-md border border-slate-200 group-hover:border-sky-500 flex items-center justify-center"></div>
                        <span className="text-sm text-slate-600 group-hover:text-sky-600">OTC (Over the Counter)</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
