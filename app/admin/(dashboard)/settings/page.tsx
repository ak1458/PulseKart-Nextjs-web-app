'use client';

import React from 'react';
import { Book, FileText, Code, LifeBuoy, ExternalLink, ChevronRight } from '@/lib/icons';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Help & Documentation</h1>
                    <p className="text-gray-400 text-sm">Guides, references, and support for the admin panel</p>
                </div>
                <button className="glass-button px-4 py-2 border border-white/10 text-gray-200 rounded-lg text-sm font-bold hover:text-white flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4" /> Contact Support
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Getting Started */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-teal-400" />
                            Module Guides
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {([] as { title: string; desc: string }[]).map((guide, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-teal-400/40 hover:bg-white/10 transition-all cursor-pointer group">
                                    <h3 className="font-bold text-white group-hover:text-teal-300 mb-1">{guide.title}</h3>
                                    <p className="text-xs text-gray-400">{guide.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5 text-purple-400" />
                            Developer Resources
                        </h2>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                                        <FileText className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">API Documentation</p>
                                        <p className="text-xs text-gray-400">REST API endpoints and schemas</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                                        <Code className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">System Status</p>
                                        <p className="text-xs text-gray-400">Uptime and service health</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs font-medium text-green-400">All Systems Operational</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-2xl text-white shadow-lg border border-teal-400/20">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-teal-100 text-sm mb-6">
                            Our support team is available 24/7 to assist you with any technical issues.
                        </p>
                        <button className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/20">
                            Open Support Ticket
                        </button>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-white mb-4">Recent Updates</h3>
                        <div className="space-y-4">
                            {([] as { ver: string; date: string; desc: string }[]).map((update, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5"></div>
                                        {idx !== 2 && <div className="w-0.5 h-full bg-white/10 my-1"></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-white">{update.ver}</span>
                                            <span className="text-[10px] text-gray-500">{update.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{update.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

