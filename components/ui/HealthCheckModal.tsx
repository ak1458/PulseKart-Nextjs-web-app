'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartPulse, Frown, Meh, Smile, AlertCircle, Stethoscope, Pill, ArrowRight } from '@/lib/icons';
import Link from 'next/link';

interface HealthCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    diseaseName?: string;
    medicineName?: string;
    daysSincePurchase?: number;
}

export default function HealthCheckModal({ 
    isOpen, 
    onClose, 
    diseaseName = 'your condition',
    medicineName = 'prescribed medicine',
    daysSincePurchase = 7
}: HealthCheckModalProps) {
    const [step, setStep] = useState<'mood' | 'details' | 'suggestion'>('mood');
    const [selectedMood, setSelectedMood] = useState<'worse' | 'same' | 'better' | null>(null);
    const [symptoms, setSymptoms] = useState<string[]>([]);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep('mood');
            setSelectedMood(null);
            setSymptoms([]);
        }
    }, [isOpen]);

    const handleMoodSelect = (mood: 'worse' | 'same' | 'better') => {
        setSelectedMood(mood);
        if (mood === 'better') {
            setStep('suggestion');
        } else {
            setStep('details');
        }
    };

    const handleSubmit = () => {
        setStep('suggestion');
    };

    const symptomOptions = [
        'Fever', 'Headache', 'Nausea', 'Dizziness', 
        'Pain', 'Rash', 'Breathing issues', 'Fatigue'
    ];

    const toggleSymptom = (symptom: string) => {
        setSymptoms(prev => 
            prev.includes(symptom) 
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
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
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 mx-4"
                    >
                        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                        <HeartPulse className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Health Check-in</h2>
                                        <p className="text-xs text-gray-400">{daysSincePurchase} days since your purchase</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Step 1: Mood Selection */}
                            {step === 'mood' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <p className="text-gray-300 text-center">
                                        How are you feeling with your <span className="text-teal-400 font-semibold">{diseaseName}</span> treatment?
                                    </p>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleMoodSelect('worse')}
                                            className="p-4 glass-panel rounded-2xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all flex flex-col items-center gap-2"
                                        >
                                            <Frown className="w-8 h-8 text-red-400" />
                                            <span className="text-sm text-gray-300">Worse</span>
                                        </button>
                                        <button
                                            onClick={() => handleMoodSelect('same')}
                                            className="p-4 glass-panel rounded-2xl border border-white/10 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all flex flex-col items-center gap-2"
                                        >
                                            <Meh className="w-8 h-8 text-yellow-400" />
                                            <span className="text-sm text-gray-300">Same</span>
                                        </button>
                                        <button
                                            onClick={() => handleMoodSelect('better')}
                                            className="p-4 glass-panel rounded-2xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex flex-col items-center gap-2"
                                        >
                                            <Smile className="w-8 h-8 text-emerald-400" />
                                            <span className="text-sm text-gray-300">Better</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Details for Worse/Same */}
                            {step === 'details' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">We&apos;re sorry to hear that</span>
                                    </div>
                                    
                                    <p className="text-gray-300 text-sm">
                                        Are you experiencing any of these symptoms?
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {symptomOptions.map(symptom => (
                                            <button
                                                key={symptom}
                                                onClick={() => toggleSymptom(symptom)}
                                                className={`px-3 py-2 rounded-full text-sm transition-all ${
                                                    symptoms.includes(symptom)
                                                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                {symptom}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-3 btn-gradient text-white font-bold rounded-xl mt-4"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 3: Suggestions */}
                            {step === 'suggestion' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {selectedMood === 'better' ? (
                                        <>
                                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                                <Smile className="w-5 h-5" />
                                                <span className="text-sm font-medium">Great news!</span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                We&apos;re glad you&apos;re feeling better! Continue taking <span className="text-teal-400">{medicineName}</span> as prescribed. Remember to complete the full course even if symptoms improve.
                                            </p>
                                            <div className="p-4 glass-panel rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                                <p className="text-sm text-emerald-300">
                                                    💡 Tip: Stay hydrated and maintain a healthy diet for faster recovery.
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                                <Stethoscope className="w-5 h-5" />
                                                <span className="text-sm font-medium">Medical Attention Needed</span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                Since your symptoms persist, we recommend consulting a doctor for a follow-up examination.
                                            </p>
                                            
                                            <div className="space-y-3">
                                                <Link
                                                    href="/consult"
                                                    className="flex items-center gap-3 p-4 glass-panel rounded-xl border border-teal-500/30 hover:bg-teal-500/10 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                                        <Stethoscope className="w-5 h-5 text-teal-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-white">Consult a Doctor</p>
                                                        <p className="text-xs text-gray-400">Get professional medical advice</p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-teal-400" />
                                                </Link>

                                                {symptoms.length <= 2 && (
                                                    <Link
                                                        href="/shop"
                                                        className="flex items-center gap-3 p-4 glass-panel rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                            <Pill className="w-5 h-5 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-white">Over-the-Counter Relief</p>
                                                            <p className="text-xs text-gray-400">Browse symptom relief medicines</p>
                                                        </div>
                                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                                    </Link>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 glass-panel text-white font-bold rounded-xl border border-white/10 hover:bg-white/5 mt-4"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
