'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Plus, Calendar } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    options?: string[];
    action?: string;
}

export default function HealthChatbot() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', content: "Hello! I'm PulseKart's Health Assistant. How can I help you today?" }
    ]);
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
            const res = await fetch('/api/v1/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Bot className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">Health Assistant</h1>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button className="text-sm text-teal-600 font-medium hover:underline">
                    Emergency? Call 108
                </button>
            </header>

            {/* Chat Area */}
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-teal-600'
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>

                            <div className="space-y-2">
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-teal-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
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
                                                className="px-4 py-2 bg-white border border-teal-200 text-teal-700 text-sm rounded-full hover:bg-teal-50 transition-colors shadow-sm"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Action Cards */}
                                {msg.action === 'book_appointment' && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <Calendar className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">Dr. Sharma</h3>
                                            <p className="text-xs text-gray-500">General Physician • 4:00 PM Today</p>
                                        </div>
                                        <button className="ml-auto px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                                            Book Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm ml-11">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </main>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <Plus className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                        placeholder="Type your symptoms..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-6 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
