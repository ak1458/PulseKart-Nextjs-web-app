'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, ShieldCheck, Phone, MapPin, Clock, Stethoscope } from 'lucide-react';
import Link from 'next/link';

type Message = {
    id: string;
    role: 'user' | 'bot';
    content: string;
    citations?: string[];
    confidence?: number;
    isEmergency?: boolean;
    isReferral?: boolean;
};

type IntakeData = {
    age: string;
    sex: string;
    location: string;
    duration: string;
};

export default function ConsultPage() {
    const [step, setStep] = useState<'disclaimer' | 'intake' | 'chat'>('disclaimer');
    const [intakeData, setIntakeData] = useState<IntakeData>({ age: '', sex: '', location: '', duration: '' });
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            content: 'Hello! I am your PulseKart medical assistant. I have reviewed your intake details. How can I help you today?',
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, step]);

    const handleIntakeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (intakeData.age && intakeData.sex && intakeData.location && intakeData.duration) {
            setStep('chat');
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock RAG & Triage Logic
        setTimeout(() => {
            const lowerInput = input.toLowerCase();
            const isRedFlag = lowerInput.includes('chest pain') || lowerInput.includes('breathing') || lowerInput.includes('unconscious');
            const isChronic = intakeData.duration.includes('week') || intakeData.duration.includes('month') || lowerInput.includes('diabetes');

            if (isRedFlag) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: "⚠️ EMERGENCY ALERT: Your symptoms suggest a potential medical emergency. Please visit the nearest hospital immediately or call an ambulance.",
                    isEmergency: true
                };
                setMessages(prev => [...prev, botMsg]);
            } else if (isChronic) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: "Your symptoms appear to be chronic or require specialist attention. I strongly recommend consulting a doctor for a detailed examination.",
                    isReferral: true,
                    confidence: 0.9
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: "Based on your description and intake details, this could be a mild viral infection or seasonal allergy. Rest and hydration are recommended. Here are some common over-the-counter options.",
                    citations: ['CDC Guidelines: Viral Management', 'NHS: Common Cold'],
                    confidence: 0.85
                };
                setMessages(prev => [...prev, botMsg]);
            }
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">

            {/* Step 1: Disclaimer Modal */}
            {step === 'disclaimer' && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center animate-scale-up">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Medical Disclaimer</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            I am an AI assistant, NOT a doctor. My advice is for informational purposes only. <br />
                            <strong>In case of emergency, call 108 immediately.</strong>
                        </p>
                        <button
                            onClick={() => setStep('intake')}
                            className="w-full bg-[#14b8a6] text-white font-bold py-3 rounded-xl hover:bg-[#0f766e] transition-colors"
                        >
                            I Understand & Agree
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Intake Form */}
            {step === 'intake' && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Stethoscope className="w-6 h-6 text-[#14b8a6]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Patient Intake</h2>
                            <p className="text-sm text-gray-500">Please provide basic details for better assistance.</p>
                        </div>

                        <form onSubmit={handleIntakeSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#14b8a6] outline-none"
                                        value={intakeData.age}
                                        onChange={e => setIntakeData({ ...intakeData, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Sex</label>
                                    <select
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#14b8a6] outline-none bg-white"
                                        value={intakeData.sex}
                                        onChange={e => setIntakeData({ ...intakeData, sex: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Location (City)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Lucknow"
                                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#14b8a6] outline-none"
                                        value={intakeData.location}
                                        onChange={e => setIntakeData({ ...intakeData, location: e.target.value })}
                                    />
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Duration of Symptoms</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2 days, 1 week"
                                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#14b8a6] outline-none"
                                        value={intakeData.duration}
                                        onChange={e => setIntakeData({ ...intakeData, duration: e.target.value })}
                                    />
                                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#14b8a6] text-white font-bold py-3 rounded-xl hover:bg-[#0f766e] transition-colors mt-4"
                            >
                                Start Consultation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Step 3: Chat Interface */}
            {step === 'chat' && (
                <>
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-[#14b8a6]" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Medical Assistant</h1>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-green-500" /> AI Powered • Verified Sources
                                </p>
                            </div>
                        </div>
                        <button className="text-red-500 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Emergency: 108
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-teal-100'
                                        }`}
                                >
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-[#14b8a6]" />}
                                </div>
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-[#14b8a6] text-white rounded-tr-none'
                                            : msg.isEmergency
                                                ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-none'
                                                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    <p className="leading-relaxed">{msg.content}</p>

                                    {msg.isReferral && (
                                        <div className="mt-3 pt-3 border-t border-gray-200/50">
                                            <Link href="/doctors">
                                                <button className="w-full bg-white border border-gray-200 text-[#14b8a6] font-bold py-2 rounded-lg hover:bg-teal-50 transition-colors text-xs">
                                                    Find Doctors Near You
                                                </button>
                                            </Link>
                                        </div>
                                    )}

                                    {msg.citations && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Sources</p>
                                                {msg.confidence && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                                        {msg.confidence * 100}% Confidence
                                                    </span>
                                                )}
                                            </div>
                                            <ul className="list-disc pl-3 space-y-0.5">
                                                {msg.citations.map((cite, idx) => (
                                                    <li key={idx} className="text-xs text-gray-500 italic">{cite}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-4 border-t border-gray-200 rounded-b-2xl shadow-sm">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Describe your symptoms..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="bg-[#14b8a6] text-white p-3 rounded-xl hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
