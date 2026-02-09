import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Phone,
    Mail,
    MapPin,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    Loader2,
    UserCheck
} from 'lucide-react';
import { userAPI } from '../../services/apiService';

export default function AgentCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: 'SALON_OWNER' });
            setCustomers(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch assigned customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.salonName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">My Salon Network</h1>
                    <p className="text-sm text-neutral-500 font-medium">Manage and track performance of your assigned salon partners.</p>
                </div>
                <div className="relative group max-w-sm flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search salon or owner name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-100 rounded-xl text-xs font-medium outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-neutral-100">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                    <p className="text-neutral-400 font-bold tracking-widest text-[10px] uppercase">Retrieving your network...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-neutral-100 text-center">
                    <Users className="text-neutral-200" size={48} />
                    <div className="space-y-1">
                        <p className="text-neutral-900 font-bold">No Salons Assigned</p>
                        <p className="text-neutral-400 text-sm">Reach out to admin to start building your network.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div key={customer._id} className="group bg-white rounded-[32px] border border-neutral-100 shadow-sm hover:border-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/5 transition-all flex flex-col overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <UserCheck className="w-7 h-7" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{customer.salonName || 'Premium Salon'}</h3>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">{customer.firstName} {customer.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="px-2.5 py-1 bg-neutral-50 rounded-lg text-[10px] font-black text-neutral-500 uppercase">
                                        ID: #{customer._id.slice(-4)}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-3 text-neutral-500">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-medium truncate">{customer.address || 'Mumbai, Maharashtra'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-500">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-medium">{customer.phoneNumber || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-50 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Sales</span>
                                        <span className="text-sm font-black text-neutral-900">₹{customer.totalSalesGenerated?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Last Order</span>
                                        <span className="text-[11px] font-bold text-emerald-600">3 Days Ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-4 bg-neutral-50 group-hover:bg-emerald-50 transition-colors border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-neutral-200" />
                                    ))}
                                </div>
                                <button className="flex items-center gap-1.5 text-[10px] font-black text-neutral-900 uppercase hover:text-emerald-600 transition-colors">
                                    Full Report <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
