'use client';

import React, { useState } from 'react';
import { MapPin, Phone, CheckCircle, Navigation, Clock, Package } from 'lucide-react';

export default function RiderDashboard() {
    const [tasks, setTasks] = useState([
        {
            id: 'ORD-1001',
            customer: 'Rahul Sharma',
            address: '123, Green Park, New Delhi',
            distance: '2.5 km',
            time: '15 mins',
            status: 'pending', // pending, picked_up, delivered
            items: 3,
            amount: 450,
            payment: 'COD'
        },
        {
            id: 'ORD-1002',
            customer: 'Priya Singh',
            address: '45, Sector 18, Noida',
            distance: '5.2 km',
            time: '30 mins',
            status: 'assigned',
            items: 1,
            amount: 120,
            payment: 'Prepaid'
        }
    ]);

    const updateStatus = (id: string, newStatus: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-medium mb-1">Today's Earnings</div>
                    <div className="text-2xl font-bold text-gray-900">₹850</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs font-medium mb-1">Completed</div>
                    <div className="text-2xl font-bold text-teal-600">12</div>
                </div>
            </div>

            <h2 className="font-bold text-gray-800 text-lg mt-6">Active Deliveries</h2>

            {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{task.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.payment === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {task.payment}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{task.items} Items • ₹{task.amount}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-teal-600">{task.time}</div>
                            <div className="text-xs text-gray-400">{task.distance}</div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-50 rounded-full mt-1">
                                <MapPin className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{task.customer}</div>
                                <div className="text-xs text-gray-500 leading-relaxed">{task.address}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-200">
                                <Phone className="w-4 h-4" /> Call
                            </button>
                            <button className="flex-1 py-2.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-teal-100">
                                <Navigation className="w-4 h-4" /> Map
                            </button>
                        </div>

                        {task.status === 'pending' && (
                            <button
                                onClick={() => updateStatus(task.id, 'picked_up')}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
                            >
                                <Package className="w-5 h-5" />
                                Confirm Pickup
                            </button>
                        )}

                        {task.status === 'picked_up' && (
                            <button
                                onClick={() => updateStatus(task.id, 'delivered')}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark Delivered
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
