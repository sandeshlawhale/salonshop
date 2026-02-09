import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Phone,
    Phone as PhoneIcon,
    Mail,
    MapPin,
    ChevronRight,
    Loader2,
    UserCheck,
    Plus,
    X,
    User as UserIcon,
    Lock
} from 'lucide-react';
import { userAPI, agentAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AgentCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Registration Modal State
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [regData, setRegData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

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

    const handleRegisterSalon = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            await agentAPI.registerSalonOwner(regData);
            toast.success('Salon Owner registered and linked successfully!');
            setShowRegisterModal(false);
            setRegData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
            fetchCustomers(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegLoading(false);
        }
    };

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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-6 py-2.5 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-neutral-900/10 active:scale-95"
                    >
                        <Plus size={14} />
                        Add New Salon
                    </button>
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

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-neutral-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">Onboard Salon</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Add new salon details</p>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-3 hover:bg-neutral-50 rounded-2xl transition-colors"
                            >
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterSalon} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.firstName}
                                            onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                            value={regData.lastName}
                                            onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={regData.email}
                                        onChange={e => setRegData({ ...regData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={regData.phone}
                                        onChange={e => setRegData({ ...regData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Initial Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={regData.password}
                                        onChange={e => setRegData({ ...regData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={regLoading}
                                className="w-full py-5 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {regLoading ? <Loader2 className="animate-spin" size={18} /> : 'CREATE ACCOUNT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
