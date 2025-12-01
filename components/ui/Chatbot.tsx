'use client';

import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi there! 👋 I\'m PulseBot. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { type: 'user', text: input };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({
                        role: m.type === 'user' ? 'user' : 'assistant',
                        content: m.text
                    }))
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { type: 'bot', text: data.content }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 bg-cyan-500 hover:bg-cyan-600 text-white p-3.5 rounded-2xl shadow-lg shadow-cyan-200 transition-all duration-300 hover:scale-110 hover:-rotate-6 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <Bot className="w-7 h-7" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-cyan-500 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">PulseBot</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                <span className="text-cyan-50 text-xs font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.type === 'user' ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    />
                    <button type="submit" className="p-2.5 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 shadow-md shadow-cyan-100 transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </>
    );
}
