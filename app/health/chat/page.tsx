'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Plus, Calendar } from '@/lib/icons';
import { apiUrl } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    options?: string[];
    action?: string;
}

export default function HealthChatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(apiUrl('chatbot/chat'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.status === 404) {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: "Service temporarily unavailable. Please try again later or contact support."
                };
                setMessages(prev => [...prev, botMsg]);
                return;
            }

            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: data.message,
                options: data.options,
                action: data.action
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat failed', error);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: "I'm having trouble connecting right now. Please try again in a moment."
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col text-white">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
                {/* Header */}
                <header className="sticky top-[var(--site-top-offset)] z-10">
                    <div className="max-w-4xl w-full">
                        <div className="glass-panel border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
                                    <Bot className="w-6 h-6 text-teal-300" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-white">Health Assistant</h1>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button className="text-sm text-teal-300 font-medium hover:text-teal-200">
                                Emergency? Call 108
                            </button>
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <main className="flex-1 max-w-4xl w-full pt-6 pb-[calc(var(--site-bottom-offset)+6rem)] space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="p-4 bg-teal-500/10 rounded-full border border-teal-500/20 mb-4">
                                <Bot className="w-12 h-12 text-teal-300" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">How can I help you today?</h2>
                            <p className="text-gray-400 max-w-md">
                                Describe your symptoms or health concerns and I&apos;ll assist you with guidance 
                                and connect you to the right healthcare services.
                            </p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'user'
                                        ? 'bg-white/5 border-white/10 text-gray-200'
                                        : 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-400/30 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-gray-200" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>

                                <div className="space-y-2">
                                    <div className={`p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-tr-none shadow-[0_10px_30px_rgba(16,185,129,0.25)]'
                                            : 'glass-panel border border-white/10 text-gray-200 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>

                                    {/* Quick Options */}
                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(opt)}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 text-teal-300 text-sm rounded-full hover:bg-white/10 transition-colors"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Cards */}
                                    {msg.action === 'book_appointment' && (
                                        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                                <Calendar className="w-6 h-6 text-indigo-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">Appointment available</h3>
                                                <p className="text-xs text-gray-400">Choose a doctor and time slot to continue.</p>
                                            </div>
                                            <button className="ml-auto px-3 py-1.5 bg-indigo-500/80 text-white text-xs font-bold rounded-lg hover:bg-indigo-500">
                                                View Slots
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-white/10 ml-11">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </main>

                {/* Input Area */}
                <div className="sticky bottom-[var(--site-bottom-offset)]">
                    <div className="max-w-4xl w-full pb-4">
                        <div className="glass-panel border border-white/10 p-4 rounded-2xl flex gap-3">
                            <button className="p-3 text-gray-400 hover:bg-white/5 rounded-full transition-colors border border-white/10">
                                <Plus className="w-6 h-6" />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                placeholder="Type your symptoms..."
                                className="flex-1 bg-black/20 border border-white/10 rounded-full px-6 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none text-white placeholder-gray-500"
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || loading}
                                className="p-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

