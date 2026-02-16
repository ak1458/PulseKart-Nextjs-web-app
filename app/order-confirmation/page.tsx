'use client';

import React, { Suspense, useEffect } from 'react';
import { CheckCircle, Package, ArrowRight, Home } from '@/lib/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { savePurchase } from '@/lib/health-check';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || searchParams.get('order') || '';
    const eta = searchParams.get('eta') || '';
    const hasOrderId = Boolean(orderId);
    const hasEta = Boolean(eta);

    // Save purchase for health check follow-up
    useEffect(() => {
        // Only save if we have actual order data from localStorage
        const recentOrder = localStorage.getItem('pulsekart_recent_order');
        if (recentOrder) {
            const orderData = JSON.parse(recentOrder);
            savePurchase(orderData.diseaseName || 'General Health', orderData.medicineName || 'Prescribed Medicine');
            localStorage.removeItem('pulsekart_recent_order');
        }
        // No fallback - only save real order data
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-panel max-w-lg w-full rounded-3xl shadow-2xl p-8 text-center border border-white/10 relative z-10"
            >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
                <p className="text-gray-400 mb-8">
                    {hasOrderId ? (
                        <>Thank you for your purchase. Your order <span className="font-bold text-white">#{orderId}</span> has been placed successfully.</>
                    ) : (
                        <>Thank you for your purchase. Your order has been placed successfully.</>
                    )}
                </p>

                {/* Health Check Notice */}
                <div className="glass-panel rounded-xl p-4 mb-6 text-left border border-teal-500/20 bg-teal-500/5">
                    <p className="text-sm text-teal-300">
                        💚 We&apos;ll check in with you in a few days to see how you&apos;re feeling!
                    </p>
                </div>

                <div className="glass-panel rounded-xl p-6 mb-8 text-left border border-white/10">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                            <Package className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Estimated Delivery</p>
                            <p className="text-sm text-gray-400">
                                {hasEta ? eta : "We'll share your delivery window in your dashboard once it's confirmed."}
                            </p>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-teal-500 ${hasEta ? 'w-1/4' : 'w-0'}`}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Order Placed &bull; Processing &bull; Shipped &bull; Delivered</p>
                </div>

                <div className="space-y-3">
                    <Link href="/dashboard" className="block w-full btn-gradient text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2">
                        Track Order <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/" className="block w-full glass-panel text-gray-300 font-bold py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" /> Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] via-[#0b1324] to-[#0f172a]">
                <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
