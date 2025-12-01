'use client';

import React from 'react';
import { Book, FileText, Code, LifeBuoy, ExternalLink, ChevronRight } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Help & Documentation</h1>
                    <p className="text-gray-500 text-sm">Guides, references, and support for the admin panel</p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4" /> Contact Support
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Getting Started */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-teal-600" />
                            Module Guides
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Order Management', desc: 'Processing, shipping, and returns flow.' },
                                { title: 'Inventory & Warehouse', desc: 'Stock adjustments, bin mapping, and AI routes.' },
                                { title: 'User Management', desc: 'Adding employees, roles, and payroll.' },
                                { title: 'Finance & Reports', desc: 'Reconciliation, refunds, and export logic.' },
                                { title: 'Coupons & Offers', desc: 'Creating campaigns and discount rules.' },
                                { title: 'Delivery Logistics', desc: 'Managing zones, costs, and partners.' }
                            ].map((guide, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group">
                                    <h3 className="font-bold text-gray-900 group-hover:text-teal-700 mb-1">{guide.title}</h3>
                                    <p className="text-xs text-gray-500">{guide.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5 text-purple-600" />
                            Developer Resources
                        </h2>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">API Documentation</p>
                                        <p className="text-xs text-gray-500">REST API endpoints and schemas</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                                        <Code className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">System Status</p>
                                        <p className="text-xs text-gray-500">Uptime and service health</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs font-medium text-green-600">All Systems Operational</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-teal-100 text-sm mb-6">
                            Our support team is available 24/7 to assist you with any technical issues.
                        </p>
                        <button className="w-full py-3 bg-white text-teal-700 rounded-xl font-bold text-sm hover:bg-teal-50 transition-colors">
                            Open Support Ticket
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Recent Updates</h3>
                        <div className="space-y-4">
                            {[
                                { ver: 'v2.4.0', date: 'Today', desc: 'Added Finance Dashboard & Delivery Zones' },
                                { ver: 'v2.3.5', date: 'Yesterday', desc: 'Fixed Order CSV Export & Inventory Sync' },
                                { ver: 'v2.3.0', date: '2 days ago', desc: 'Launched Warehouse AI Pathfinding' }
                            ].map((update, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5"></div>
                                        {idx !== 2 && <div className="w-0.5 h-full bg-gray-100 my-1"></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-gray-900">{update.ver}</span>
                                            <span className="text-[10px] text-gray-400">{update.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{update.desc}</p>
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
