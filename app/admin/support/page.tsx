'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle, User, Send } from 'lucide-react';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/v1/tickets');
            const data = await res.json();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/v1/tickets/${id}`);
            const data = await res.json();
            setSelectedTicket(data);
        } catch (error) {
            console.error('Failed to fetch ticket details', error);
        }
    };

    const sendReply = async () => {
        if (!reply.trim() || !selectedTicket) return;
        try {
            await fetch(`/api/v1/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply, is_internal: false })
            });
            setReply('');
            fetchTicketDetails(selectedTicket.id); // Refresh chat
        } catch (error) {
            console.error('Failed to send reply', error);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            await fetch(`/api/v1/tickets/${selectedTicket.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchTicketDetails(selectedTicket.id);
            fetchTickets(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-fade-in">
            {/* Ticket List */}
            <div className="w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-gray-900">Support Tickets</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No tickets found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => fetchTicketDetails(ticket.id)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(ticket.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {ticket.user_name} • #{ticket.id}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Detail / Chat */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>User #{selectedTicket.user_id}</span>
                                    <span>•</span>
                                    <span className="capitalize">{selectedTicket.category}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateStatus('resolved')}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                                >
                                    <CheckCircle className="w-4 h-4" /> Resolve
                                </button>
                                <button
                                    onClick={() => updateStatus('closed')}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                            {selectedTicket.messages?.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.sender_id === selectedTicket.user_id ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-4 ${msg.sender_id === selectedTicket.user_id
                                            ? 'bg-white border border-gray-200 text-gray-800'
                                            : 'bg-teal-600 text-white shadow-md'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <div className={`text-xs mt-2 ${msg.sender_id === selectedTicket.user_id ? 'text-gray-400' : 'text-teal-100'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.is_internal && ' (Internal Note)'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-4">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none h-24"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim()}
                                    className="px-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
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
