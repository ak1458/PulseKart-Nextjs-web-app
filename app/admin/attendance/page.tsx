'use client';

import React, { useState } from 'react';
import {
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
    id: string;
    employee: string;
    date: string;
    checkIn: string;
    checkOut: string | null;
    status: 'Present' | 'Late' | 'Absent' | 'Half Day';
    location: string;
    duration: string;
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    {
        id: 'ATT-001',
        employee: 'Dr. Sarah Wilson',
        date: '2023-11-30',
        checkIn: '08:55 AM',
        checkOut: null,
        status: 'Present',
        location: 'Pharmacy HQ',
        duration: 'Running...'
    },
    {
        id: 'ATT-002',
        employee: 'Rahul Verma',
        date: '2023-11-30',
        checkIn: '09:15 AM',
        checkOut: null,
        status: 'Late',
        location: 'Warehouse A',
        duration: 'Running...'
    },
    {
        id: 'ATT-003',
        employee: 'Priya Singh',
        date: '2023-11-30',
        checkIn: '-',
        checkOut: '-',
        status: 'Absent',
        location: '-',
        duration: '0h 0m'
    }
];

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-teal-600" />
                        Attendance & Shifts
                    </h1>
                    <p className="text-gray-500 text-sm">Track employee check-ins and working hours</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        <CheckCircle className="w-4 h-4" />
                        Manual Check-in
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Present Today', value: '24', sub: '85% of staff', color: 'green', icon: CheckCircle },
                    { label: 'Late Arrivals', value: '3', sub: '> 15 mins', color: 'orange', icon: Clock },
                    { label: 'On Leave', value: '2', sub: 'Approved', color: 'blue', icon: Calendar },
                    { label: 'Absent', value: '1', sub: 'Unexplained', color: 'red', icon: XCircle },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            <p className={`text-xs font-medium text-${stat.color}-600 mt-1`}>{stat.sub}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-4">
                        <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option>All Departments</option>
                            <option>Pharmacy</option>
                            <option>Logistics</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                {record.employee.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900">{record.employee}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{record.checkIn}</td>
                                    <td className="px-6 py-4 font-medium text-gray-500">{record.checkOut || '--:--'}</td>
                                    <td className="px-6 py-4 text-gray-500">{record.duration}</td>
                                    <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                                        {record.location !== '-' && <MapPin className="w-3 h-3" />}
                                        {record.location}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                record.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-teal-600 hover:text-teal-700 font-medium text-xs">View Log</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
