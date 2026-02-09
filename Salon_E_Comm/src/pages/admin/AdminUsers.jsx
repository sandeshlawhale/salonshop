import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Download,
    UserPlus,
    Loader2,
    Mail,
    Phone,
    ShieldCheck
} from 'lucide-react';
import { userAPI } from '../../services/apiService';
import { Button } from '../../components/ui/button';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('SALON_OWNER');

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: filterRole });
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, status) => {
        try {
            // Assuming there's a status update endpoint in userAPI
            // await userAPI.updateStatus(userId, status);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Identity <span className="text-emerald-600">Registry</span></h1>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage professional salon owner credentials</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-xs font-bold outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                    </div>

                    <Button className="h-12 px-6 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-neutral-900/10 active:scale-[0.95] transition-all flex items-center gap-2">
                        <UserPlus size={16} />
                        Onboard New
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-neutral-100">
                    <div className="relative">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <div className="absolute inset-0 bg-emerald-600/10 blur-xl rounded-full" />
                    </div>
                    <p className="text-neutral-400 font-black tracking-widest text-[10px] uppercase animate-pulse">Accessing Core Databases...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Professional</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Affiliation</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Contact Node</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-neutral-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-emerald-600 group-hover:text-white transition-all overflow-hidden border-2 border-transparent group-hover:border-emerald-50 content-none">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-neutral-900 tracking-tight uppercase text-xs">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1">ID: #{user._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                                <span className="text-xs font-black text-neutral-600 uppercase tracking-tight">{user.salonName || 'Independent Pro'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 space-y-1">
                                            <div className="flex items-center gap-2 text-neutral-500">
                                                <Mail size={12} />
                                                <span className="text-[11px] font-bold">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-500">
                                                <Phone size={12} />
                                                <span className="text-[11px] font-bold">{user.phoneNumber || '98765 43210'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.isVerified
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {user.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2.5 bg-neutral-50 text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-xl transition-all shadow-sm">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2.5 bg-neutral-50 text-neutral-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button className="p-2.5 bg-neutral-50 text-neutral-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Showing {filteredUsers.length} active professional entities</p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-neutral-200">
                                <Download size={14} className="mr-2" />
                                Export Ledger
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
