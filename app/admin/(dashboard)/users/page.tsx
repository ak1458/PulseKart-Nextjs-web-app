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
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders } from '@/context/AuthContext';
import { getAvatarImage } from '@/lib/images';

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
    const [loadError, setLoadError] = useState<string | null>(null);
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
        void fetchStaff();
    }, []);

    /**
     * Load staff from the API.
     *
     * Three things were wrong here. It requested `employees`, which no
     * controller serves - the endpoint is `v1/users`. It sent no Authorization
     * header, so that route's AdminGuard would have rejected it regardless. And
     * it cached the result in localStorage and preferred the cache on every
     * subsequent load, so once anything was stored the page never contacted the
     * server again and a failure was indistinguishable from an empty team.
     */
    const fetchStaff = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch(apiUrl('users'), { headers: getAuthHeaders() });
            if (!res.ok) {
                throw new Error(
                    res.status === 401 || res.status === 403
                        ? 'You do not have permission to view staff.'
                        : `Failed to load staff (${res.status})`,
                );
            }
            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];
            // Map backend data to frontend interface if needed
            // Assuming backend returns matching fields or we map them here
            // The User entity has no department or phone. Rather than invent
            // them, they render as em dashes and `status` is derived from
            // isActive, which does exist.
            const mapped: Staff[] = list.map((user: Record<string, unknown>) => ({
                id: String(user.id),
                name: String(user.name ?? ''),
                role: String(user.role ?? 'customer'),
                email: String(user.email ?? ''),
                phone: typeof user.phone === 'string' ? user.phone : '',
                status: user.isActive === false ? 'Inactive' : 'Active',
                department: '',
                joinDate: typeof user.createdAt === 'string' ? user.createdAt : '',
                avatar: getAvatarImage(''),
            }));

            setStaff(mapped);
        } catch (error) {
            console.error('Failed to fetch staff', error);
            setLoadError(error instanceof Error ? error.message : 'Could not load staff.');
            setStaff([]);
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
            avatar: getAvatarImage(emp.avatar)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        const updated = staff.filter(s => s.id !== id);
        setStaff(updated);
        localStorage.setItem('admin_staff', JSON.stringify(updated));

        try {
            await fetch(apiUrl(`employees/${id}`), { method: 'DELETE' });
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? apiUrl(`employees/${editingId}`) : apiUrl('employees');
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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-teal-400" />
                        Staff Directory
                    </h1>
                    <p className="text-gray-400 text-sm">Manage your team, roles, and permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', email: '', phone: '', role: '', department: '', status: 'Active', avatar: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 btn-gradient text-white rounded-xl font-bold shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Employee
                </button>
            </div>

            {/* Filters & Search */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, role, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-white placeholder-gray-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 [color-scheme:dark]">
                        <option value="all">All Departments</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Inventory">Inventory</option>
                    </select>
                    <select className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 [color-scheme:dark]">
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-center col-span-3 py-8 text-gray-400">Loading staff...</p>
                ) : loadError ? (
                    // Distinguished from "no staff": the two used to look identical,
                    // so a failed request read as an empty team.
                    <div className="col-span-3 rounded-xl border border-red-500/40 bg-red-500/10 py-8 text-center">
                        <p className="font-bold text-red-300">{loadError}</p>
                        <button
                            onClick={() => void fetchStaff()}
                            className="mt-3 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <p className="text-center col-span-3 py-8 text-gray-400">No employees found.</p>
                ) : (
                    filteredStaff.map((member) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={getAvatarImage(member.avatar)} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-white/10 shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">{member.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> {member.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(member)} className="text-gray-500 hover:text-teal-300">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(member.id)} className="text-gray-500 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        {member.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {member.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        {member.department}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                                        member.status === 'On Leave' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                                            'bg-white/5 text-gray-300 border-white/10'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-400' :
                                            member.status === 'On Leave' ? 'bg-amber-400' :
                                                'bg-gray-400'
                                            }`}></span>
                                        {member.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
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
                            className="glass-panel rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden bg-[#0B1220]"
                        >
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white placeholder-gray-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white placeholder-gray-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white placeholder-gray-500"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Role</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white placeholder-gray-500"
                                            placeholder="Pharmacist"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-1">Department</label>
                                        <select
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white [color-scheme:dark]"
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
                                    <label className="block text-sm font-bold text-gray-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:outline-none text-white [color-scheme:dark]"
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
                                        className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 btn-gradient text-white rounded-xl font-bold shadow-lg"
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

