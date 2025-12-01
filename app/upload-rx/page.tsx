"use client";

import { Upload, Camera, FileText, CheckCircle } from "lucide-react";

export default function UploadRxPage() {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Upload Prescription</h1>
                    <p className="text-slate-500">Please upload a valid prescription from your doctor. Our pharmacists will verify it before processing your order.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Click to Upload or Drag & Drop</h3>
                        <p className="text-slate-500 text-sm mb-6">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                        <button className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-sky-600 transition-colors">
                            Browse Files
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <span>OR</span>
                    </div>

                    <button className="w-full mt-8 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                        <Camera className="w-5 h-5" />
                        Use Camera
                    </button>

                    <div className="mt-12 space-y-4">
                        <h4 className="font-bold text-slate-900">Guide to a valid prescription:</h4>
                        <ul className="space-y-3">
                            {[
                                "Doctor's details and signature must be visible",
                                "Patient's name and date must be clear",
                                "Medicine names and dosage must be readable",
                                "Prescription should not be older than 6 months"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
