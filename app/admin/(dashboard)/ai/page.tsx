'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Bot,
    User,
    Sparkles,
    MoreVertical,
    Play,
    Clock,
    CheckCircle,
    AlertTriangle,
    FileText,
    Database,
    Zap,
    Shield,
    Activity
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actions?: Action[];
}

interface Action {
    id: string;
    label: string;
    type: 'primary' | 'danger' | 'neutral';
    handler: () => void;
}

export default function AIWorkerPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your AI Admin Worker. I can help you manage orders, inventory, prescriptions, and more. What would you like to do today?",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
                actions: data.actions?.map((a: any) => ({
                    ...a,
                    handler: () => alert(`Action ${a.label} triggered!`) // Placeholder handler
                }))
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Simulate response if API fails/is mocked
            setTimeout(() => {
                const mockMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "I'm currently in demo mode. I can help you navigate the system, but I can't execute live actions just yet.",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, mockMsg]);
                setIsTyping(false);
            }, 1000);
            return; // Exit here as we handled the error mock
        } finally {
            // Only stop typing if successful (error case handled above separately)
            // But for now, let's ensure it stops
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 animate-fade-in pb-4">
            {/* Left Panel: Chat Interface */}
            <div className="w-full lg:w-1/3 flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none"></div>

                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                            <Bot className="w-5 h-5 icon-glow" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white tracking-wide">AI Worker</h2>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Online & Ready
                            </span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 custom-scrollbar">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'user'
                                ? 'bg-white/10 border-white/5 text-gray-300'
                                : 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-400/30 text-white shadow-lg shadow-teal-500/20'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-[85%] space-y-2`}>
                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-tr-none border border-white/10'
                                    : 'glass-panel border-white/5 text-gray-200 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg.actions && (
                                    <div className="flex gap-2 flex-wrap">
                                        {msg.actions.map(action => (
                                            <button
                                                key={action.id}
                                                onClick={action.handler}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 border ${action.type === 'primary'
                                                    ? 'bg-teal-500/20 border-teal-500/30 text-teal-300 hover:bg-teal-500/30 hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                                                    : action.type === 'danger'
                                                        ? 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isMounted && (
                                    <span className={`text-[10px] text-gray-500 block px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600/50 border border-teal-500/30 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="glass-panel border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5 relative z-10">
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask AI Worker to do something..."
                            className="w-full pl-4 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-sm text-white placeholder-gray-500 transition-all shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-lg hover:shadow-[0_0_15px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {['Check pending orders', 'Update inventory', 'Show revenue', 'Create coupon'].map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(suggestion)}
                                className="text-xs px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-gray-400 hover:bg-white/10 hover:text-teal-300 hover:border-teal-500/30 whitespace-nowrap transition-all duration-300"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Result & Context */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Status Bar */}
                <div className="glass-panel p-4 rounded-2xl border border-white/10 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/2 pointer-events-none"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-gray-400">Permissions: <span className="text-white font-bold tracking-wide">Admin (Full)</span></span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-400">Context: <span className="text-white font-bold tracking-wide">Live Data</span></span>
                        </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-bold hover:bg-white/10 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                            <Clock className="w-3.5 h-3.5" /> History
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-bold hover:bg-white/10 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                            <Zap className="w-3.5 h-3.5" /> Automations
                        </button>
                    </div>
                </div>

                {/* Main Result Area */}
                <div className="flex-1 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-700"></div>

                    <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                        <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Ready to Assist</h3>
                    <p className="text-gray-400 max-w-md text-sm leading-relaxed relative z-10">
                        I'm waiting for your command. I can analyze data, execute tasks, and automate workflows across your entire admin panel.
                    </p>
                </div>

                {/* Quick Actions / Active Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Pending Approvals', value: '5 Items', icon: CheckCircle, color: 'orange', code: 'orange' },
                        { label: 'System Health', value: '98% Good', icon: Activity, color: 'emerald', code: 'green' },
                        { label: 'Active Workflows', value: '3 Running', icon: Play, color: 'blue', code: 'blue' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer">
                            <div className={`p-2.5 rounded-lg bg-${stat.code}-500/10 text-${stat.code}-400 border border-${stat.code}-500/20 group-hover:border-${stat.code}-500/40 transition-colors`}>
                                <stat.icon className="w-5 h-5 icon-glow" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium group-hover:text-gray-400">{stat.label}</p>
                                <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

