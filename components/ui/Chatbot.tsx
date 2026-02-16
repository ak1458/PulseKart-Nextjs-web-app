'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, X, Send, Loader2 } from '@/lib/icons';
import { sanitizeHtml, escapeHtml } from '@/lib/sanitize';
import { useMutation } from '@tanstack/react-query';

interface Message {
    type: 'bot' | 'user';
    text: string;
    isError?: boolean;
}

interface ChatResponse {
    role: string;
    content: string;
    actions?: Array<{ id: string; label: string; type: string }>;
}

async function sendChatMessage(messages: Array<{ role: string; content: string }>): Promise<ChatResponse> {
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'bot', text: "Hi there! I'm PulseBot. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Chat mutation
    const chatMutation = useMutation({
        mutationFn: sendChatMessage,
        onSuccess: (data) => {
            const sanitizedContent = escapeHtml(data.content || 'Sorry, I could not process that.');
            setMessages(prev => [...prev, {
                type: 'bot',
                text: sanitizedContent,
            }]);
        },
        onError: () => {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: "I'm having trouble connecting right now. Please try again later.",
                isError: true,
            }]);
        },
    });

    const handleSend = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput || chatMutation.isPending) return;

        // Sanitize user input
        const sanitizedInput = escapeHtml(trimmedInput);

        // Add user message
        const newMessages = [...messages, { type: 'user' as const, text: sanitizedInput }];
        setMessages(newMessages);
        setInput('');

        // Convert to API format
        const apiMessages = newMessages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
        }));

        // Send to API
        chatMutation.mutate(apiMessages);
    }, [input, messages, chatMutation]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    }, [handleSend]);

    // Hide chatbot on health pages
    if (pathname?.startsWith('/health')) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 md:bottom-6 z-40 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] border border-white/20 backdrop-blur-md ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="Open chat"
            >
                <Bot className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 md:bottom-6 z-40 w-[calc(100vw-2rem)] max-w-sm glass-panel rounded-3xl overflow-hidden transition-all duration-300 origin-bottom-right border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500/20 to-emerald-500/20 p-4 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                            <Bot className="w-6 h-6 text-teal-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">PulseBot</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_#34d399]"></span>
                                <span className="text-gray-300 text-xs font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors border border-white/5"
                        aria-label="Close chat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] p-3.5 rounded-2xl text-sm backdrop-blur-sm ${msg.type === 'user'
                                    ? 'bg-teal-500/20 text-white rounded-br-none border border-teal-500/30'
                                    : msg.isError
                                        ? 'bg-red-500/20 text-red-200 rounded-bl-none border border-red-500/30'
                                        : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/10'
                                    }`}
                                // Safe HTML rendering for bot messages (already sanitized)
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }}
                            />
                        </div>
                    ))}
                    {chatMutation.isPending && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 text-gray-400 rounded-2xl rounded-bl-none border border-white/10 p-3 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-black/20 border-t border-white/10 flex gap-2 backdrop-blur-md">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        maxLength={500}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-gray-500 transition-all hover:bg-white/10"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || chatMutation.isPending}
                        className="p-2.5 bg-teal-500/20 text-teal-300 rounded-full hover:bg-teal-500 hover:text-white border border-teal-500/30 transition-all shadow-[0_0_10px_rgba(20,184,166,0.1)] hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        {chatMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
