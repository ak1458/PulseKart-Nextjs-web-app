'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    Briefcase,
    CheckCircle,
    XCircle,
    Edit,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Staff {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    department: string;
    joinDate: string;
    avatar: string;
}

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'Active',
        avatar: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/v1/employees');
            const data = await res.json();
            // Map backend data to frontend interface if needed
            // Assuming backend returns matching fields or we map them here
            const mapped = data.map((emp: any) => ({
                id: emp.id,
                name: emp.name,
                role: emp.role,
                email: emp.email,
                phone: emp.phone,
                status: emp.status,
                department: emp.department,
                joinDate: emp.created_at,
                avatar: emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}&background=random`
            }));
            setStaff(mapped);
        } catch (error) {
            console.error('Failed to fetch staff', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (emp: Staff) => {
        setEditingId(emp.id);
        setFormData({
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            role: emp.role,
            department: emp.department,
            status: emp.status,
            avatar: emp.avatar
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            await fetch(`/api/v1/employees/${id}`, { method: 'DELETE' });
            fetchStaff();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/v1/employees/${editingId}` : '/api/v1/employees';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(`Employee ${editingId ? 'updated' : 'added'} successfully!`);
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: '', email: '', phone: '', role: '', department: '', status: 'Active', avatar: '' });
                fetchStaff();
            } else {
                alert('Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-teal-600" />
                        Staff Directory
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your team, roles, and permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', email: '', phone: '', role: '', department: '', status: 'Active', avatar: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Employee
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, role, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="all">All Departments</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Inventory">Inventory</option>
                    </select>
                    <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-center col-span-3 py-8 text-gray-500">Loading staff...</p>
                ) : filteredStaff.length === 0 ? (
                    <p className="text-center col-span-3 py-8 text-gray-500">No employees found.</p>
                ) : (
                    filteredStaff.map((member) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{member.name}</h3>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> {member.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(member)} className="text-gray-400 hover:text-teal-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(member.id)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {member.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {member.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        {member.department}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${member.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        member.status === 'On Leave' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' :
                                            member.status === 'On Leave' ? 'bg-amber-500' :
                                                'bg-gray-500'
                                            }`}></span>
                                        {member.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="Pharmacist"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        >
                                            <option value="">Select Dept</option>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Inventory">Inventory</option>
                                            <option value="Support">Support</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200"
                                    >
                                        {editingId ? 'Update Employee' : 'Add Employee'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
