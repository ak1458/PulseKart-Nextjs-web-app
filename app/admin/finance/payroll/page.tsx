'use client';

import React, { useState } from 'react';
import {
    CreditCard,
    DollarSign,
    Download,
    FileText,
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PayrollEntry {
    id: string;
    employee: string;
    role: string;
    basic: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    status: 'Paid' | 'Pending' | 'Processing';
    paymentDate?: string;
}

const MOCK_PAYROLL: PayrollEntry[] = [
    {
        id: 'PAY-NOV-001',
        employee: 'Dr. Sarah Wilson',
        role: 'Chief Pharmacist',
        basic: 45000,
        allowances: 12000,
        deductions: 5000,
        netSalary: 52000,
        status: 'Paid',
        paymentDate: '2023-11-01'
    },
    {
        id: 'PAY-NOV-002',
        employee: 'Rahul Verma',
        role: 'Delivery Lead',
        basic: 25000,
        allowances: 5000,
        deductions: 2000,
        netSalary: 28000,
        status: 'Pending'
    },
    {
        id: 'PAY-NOV-003',
        employee: 'Priya Singh',
        role: 'Inventory Manager',
        basic: 30000,
        allowances: 6000,
        deductions: 2500,
        netSalary: 33500,
        status: 'Processing'
    }
];

export default function PayrollPage() {
    const [payroll, setPayroll] = useState<PayrollEntry[]>(MOCK_PAYROLL);

    const totalPayout = payroll.reduce((acc, curr) => acc + curr.netSalary, 0);
    const pendingPayout = payroll.filter(p => p.status !== 'Paid').reduce((acc, curr) => acc + curr.netSalary, 0);

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-teal-600" />
                        Payroll & Salary
                    </h1>
                    <p className="text-gray-500 text-sm">Manage employee salaries and payouts for November 2023</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Sheet
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        <DollarSign className="w-4 h-4" />
                        Process Payouts
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-200">
                    <p className="text-teal-100 text-sm font-medium mb-1">Total Monthly Payout</p>
                    <h3 className="text-3xl font-bold">₹{totalPayout.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3" /> 3 Employees
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Pending Disbursal</p>
                    <h3 className="text-3xl font-bold text-gray-900">₹{pendingPayout.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-lg">
                        <AlertCircle className="w-3 h-3" /> Action Required
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium mb-1">Next Pay Date</p>
                    <h3 className="text-3xl font-bold text-gray-900">Dec 01</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                        <Calendar className="w-3 h-3" /> In 2 Days
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Basic Pay</th>
                                <th className="px-6 py-4">Allowances</th>
                                <th className="px-6 py-4">Deductions</th>
                                <th className="px-6 py-4">Net Salary</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payroll.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{entry.employee}</td>
                                    <td className="px-6 py-4 text-gray-500">{entry.role}</td>
                                    <td className="px-6 py-4 text-gray-700">₹{entry.basic.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-green-600">+₹{entry.allowances.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-600">-₹{entry.deductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{entry.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${entry.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                entry.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-teal-600 hover:text-teal-700 font-medium text-xs flex items-center gap-1 justify-end w-full">
                                            <FileText className="w-3 h-3" /> Slip
                                        </button>
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
