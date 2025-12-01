'use client';

import React from 'react';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order <span className="font-bold text-gray-900">#ORD-2025-8821</span> has been placed successfully.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Package className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Estimated Delivery</p>
                            <p className="text-sm text-gray-500">Today by 7:00 PM</p>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 w-1/4"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Order Placed &bull; Processing &bull; Shipped &bull; Delivered</p>
                </div>

                <div className="space-y-3">
                    <Link href="/dashboard" className="block w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                        Track Order <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/" className="block w-full bg-white text-gray-600 font-bold py-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" /> Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
