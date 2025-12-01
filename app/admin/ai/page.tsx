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
    Shield
} from 'lucide-react';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error connecting to the AI service.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-fade-in">
            {/* Left Panel: Chat Interface */}
            <div className="w-1/3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">AI Worker</h2>
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-teal-600 text-white'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`max-w-[85%] space-y-2`}>
                                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                                {msg.actions && (
                                    <div className="flex gap-2">
                                        {msg.actions.map(action => (
                                            <button
                                                key={action.id}
                                                onClick={action.handler}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${action.type === 'primary' ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' :
                                                    action.type === 'danger' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <span className="text-[10px] text-gray-400 block px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask AI Worker to do something..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {['Check pending orders', 'Update inventory', 'Show revenue', 'Create coupon'].map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(suggestion)}
                                className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-100 whitespace-nowrap transition-colors"
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
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-medium text-gray-600">Permissions: <span className="text-gray-900 font-bold">Admin (Full)</span></span>
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Context: <span className="text-gray-900 font-bold">Live Data</span></span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                            <Clock className="w-3 h-3" /> History
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                            <Zap className="w-3 h-3" /> Automations
                        </button>
                    </div>
                </div>

                {/* Main Result Area */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Assist</h3>
                    <p className="text-gray-500 max-w-md text-sm">
                        I'm waiting for your command. I can analyze data, execute tasks, and automate workflows across your entire admin panel.
                    </p>
                </div>

                {/* Quick Actions / Active Tasks */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Pending Approvals', value: '5 Items', icon: CheckCircle, color: 'orange' },
                        { label: 'System Health', value: '98% Good', icon: Activity, color: 'green' },
                        { label: 'Active Workflows', value: '3 Running', icon: Play, color: 'blue' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
