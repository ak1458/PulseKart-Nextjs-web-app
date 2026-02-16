'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle, User, Send } from '@/lib/icons';
import { apiUrl } from '@/lib/api';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    const getEmptyTickets = () => [];

    const loadCachedTickets = () => {
        try {
            const cached = localStorage.getItem('admin_tickets');
            if (!cached) return null;
            const parsed = JSON.parse(cached);
            return Array.isArray(parsed) ? parsed : null;
        } catch (error) {
            console.warn('Failed to parse cached tickets', error);
            localStorage.removeItem('admin_tickets');
            return null;
        }
    };

    const cacheTickets = (list: any[]) => {
        try {
            localStorage.setItem('admin_tickets', JSON.stringify(list));
        } catch (error) {
            console.warn('Failed to cache tickets', error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch(apiUrl('tickets'));
            if (res.status === 404) {
                const cached = loadCachedTickets();
                const fallback = cached ?? getEmptyTickets();
                setTickets(fallback);
                cacheTickets(fallback);
                return;
            }
            if (!res.ok) {
                throw new Error(`Failed to load tickets (${res.status})`);
            }
            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];
            setTickets(list);
            cacheTickets(list);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id: string) => {
        try {
            const res = await fetch(apiUrl(`tickets/${id}`));
            if (res.status === 404) {
                const cached = loadCachedTickets();
                const localList = cached ?? tickets ?? [];
                const localTicket = localList.find((t: any) => t.id === id) ?? null;
                setSelectedTicket(localTicket);
                return;
            }
            if (!res.ok) {
                throw new Error(`Failed to load ticket (${res.status})`);
            }
            const data = await res.json();
            const ticket = data?.data ?? data;
            setSelectedTicket(ticket ?? null);
        } catch (error) {
            console.error('Failed to fetch ticket details', error);
            setSelectedTicket(null);
        }
    };

    const sendReply = async () => {
        if (!reply.trim() || !selectedTicket) return;
        try {
            const res = await fetch(apiUrl(`tickets/${selectedTicket.id}/messages`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply, is_internal: false })
            });
            if (res.status === 404) {
                const newMessage = {
                    id: `MSG-${Date.now()}`,
                    sender_id: 'ADMIN',
                    message: reply,
                    created_at: new Date().toISOString(),
                    is_internal: false
                };
                const updated = {
                    ...selectedTicket,
                    messages: [...(selectedTicket.messages || []), newMessage],
                    updated_at: new Date().toISOString()
                };
                setSelectedTicket(updated);
                const updatedList = tickets.map((t: any) => t.id === selectedTicket.id ? updated : t);
                setTickets(updatedList);
                cacheTickets(updatedList);
                setReply('');
                return;
            }
            setReply('');
            fetchTicketDetails(selectedTicket.id); // Refresh chat
        } catch (error) {
            console.error('Failed to send reply', error);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            const res = await fetch(apiUrl(`tickets/${selectedTicket.id}/status`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.status === 404) {
                const updated = { ...selectedTicket, status, updated_at: new Date().toISOString() };
                setSelectedTicket(updated);
                const updatedList = tickets.map((t: any) => t.id === selectedTicket.id ? updated : t);
                setTickets(updatedList);
                cacheTickets(updatedList);
                return;
            }
            fetchTicketDetails(selectedTicket.id);
            fetchTickets(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-fade-in">
            {/* Ticket List */}
            <div className="w-1/3 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <h2 className="font-bold text-white">Support Tickets</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">Loading...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No tickets found.</div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {tickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => fetchTicketDetails(ticket.id)}
                                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-teal-500/10 border-l-4 border-teal-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${ticket.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                ticket.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(ticket.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-white truncate">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-400 truncate mt-1">
                                        {ticket.user_name} • #{ticket.id}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Detail / Chat */}
            <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                    <User className="w-4 h-4" />
                                    <span>User #{selectedTicket.user_id}</span>
                                    <span>•</span>
                                    <span className="capitalize">{selectedTicket.category}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateStatus('resolved')}
                                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 flex items-center gap-1"
                                >
                                    <CheckCircle className="w-4 h-4" /> Resolve
                                </button>
                                <button
                                    onClick={() => updateStatus('closed')}
                                    className="px-3 py-1.5 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                            {selectedTicket.messages?.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.sender_id === selectedTicket.user_id ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-4 ${msg.sender_id === selectedTicket.user_id
                                            ? 'bg-white/10 border border-white/10 text-gray-200'
                                            : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <div className={`text-xs mt-2 ${msg.sender_id === selectedTicket.user_id ? 'text-gray-500' : 'text-teal-100'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.is_internal && ' (Internal Note)'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex gap-4">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 p-3 border border-white/10 bg-black/20 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none resize-none h-24 text-white placeholder-gray-500"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim()}
                                    className="px-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                                >
                                    <Send className="w-5 h-5" />
                                    <span className="text-xs font-bold">Send</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}

