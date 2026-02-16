'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertCircle } from '@/lib/icons';
import { useRouter } from 'next/navigation';

interface SignOutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
    const router = useRouter();

    const handleSignOut = () => {
        // Clear auth tokens/localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Close modal and redirect
        onClose();
        router.push('/login');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
                    >
                        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Sign Out</h2>
                                        <p className="text-sm text-gray-400">Are you sure?</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Message */}
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                You will be signed out of your account and redirected to the login page. Your cart items will be saved.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 glass-panel rounded-xl text-white font-bold border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
