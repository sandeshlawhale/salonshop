import React, { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    TrendingUp,
    Award,
    MessageSquare,
    FileText,
    Search,
    Filter,
    Loader2,
    ChevronRight,
    Plus,
    X,
    Mail,
    Phone,
    User as UserIcon,
    Lock,
    IndianRupee,
    Briefcase,
    ShieldCheck,
    ArrowUpRight,
    ChevronDown,
    UserPlus,
    MapPin
} from 'lucide-react';
import { userAPI, adminAPI } from '../../services/apiService';
import StatCard from '../../components/admin/StatCard';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

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

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAll({ role: 'AGENT' });
            setAgents(res.data.users || []);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            toast.error('Registry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleRegisterAgent = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            await adminAPI.createAgent(regData);
            toast.success('Agent Executive created successfully!');
            setShowRegisterModal(false);
            setRegData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
            fetchAgents(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        } finally {
            setRegLoading(false);
        }
    };

    const handleStatusUpdate = async (agentId, newStatus) => {
        try {
            setUpdatingStatusId(agentId);
            await userAPI.updateStatus(agentId, newStatus);
            toast.success(`Agent status updated to ${newStatus}`);
            // Update local state
            setAgents(agents.map(a => a._id === agentId ? { ...a, status: newStatus } : a));
        } catch (err) {
            console.error('Failed to update agent status:', err);
            toast.error('Status override failed');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const deriveTier = (earnings) => {
        if (earnings >= 150000) return 'PLATINUM';
        if (earnings >= 50000) return 'GOLD';
        return 'SILVER';
    };

    const getTierColor = (tier) => {
        const tiers = {
            'SILVER': 'bg-neutral-50 text-neutral-600',
            'GOLD': 'bg-amber-50 text-amber-700',
            'PLATINUM': 'bg-emerald-50 text-emerald-700',
        };
        return tiers[tier] || 'bg-neutral-50 text-neutral-600';
    };

    const filteredAgents = agents.filter(agent => {
        const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || agent.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        totalPaid: agents.reduce((sum, a) => sum + (a.agentProfile?.totalEarnings || 0), 0),
        activeCount: agents.filter(a => a.status === 'ACTIVE').length,
        growth: '+12%'
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'text-amber-600 bg-amber-50' },
        { value: 'ACTIVE', label: 'Active', color: 'text-emerald-600 bg-emerald-50' },
        { value: 'REJECTED', label: 'Rejected', color: 'text-rose-600 bg-rose-50' },
        { value: 'DEACTIVE', label: 'Deactive', color: 'text-neutral-500 bg-neutral-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-wide">Agent Registry</h1>
                    <p className="text-base font-bold text-neutral-400 tracking-wide mt-1">Manage and monitor agent performance</p>
                </div>
                <button
                    onClick={() => setShowRegisterModal(true)}
                    className="h-12 px-6 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-neutral-900/10 active:scale-95 group"
                >
                    <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                    Add Agent
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Gross Payout"
                    value={`₹${stats.totalPaid.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                />
                <StatCard
                    title="Active Agents"
                    value={stats.activeCount}
                    icon={Briefcase}
                    color="neutral"
                />
                <StatCard
                    title="Growth"
                    value={stats.growth}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            {/* Agent Performance Table */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Agent Database</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group min-w-[280px]">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH AGENTS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-10 bg-white border border-neutral-100 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-emerald-500 transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32 h-10 bg-white border-neutral-100 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Filter size={12} className="text-neutral-400" />
                                    <SelectValue placeholder="STATUS" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ALL STATUS</SelectItem>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Agent</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Performance</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-right">actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                            <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] animate-pulse">Synchronizing Intelligence...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No matching agents found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-neutral-50/30 transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-10 h-10 border border-neutral-100">
                                                    <AvatarImage src={agent.avatar || agent.avatarUrl} />
                                                    <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-black">
                                                        {agent.firstName?.[0]}{agent.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900 leading-tight">{agent.firstName} {agent.lastName}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-neutral-400">
                                                        <MapPin size={10} />
                                                        <span className="text-[10px] uppercase font-medium tracking-wide">ID: {agent._id?.slice(-8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Mail size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium truncate max-w-[180px]">{agent.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Phone size={12} className="text-neutral-300 shrink-0" />
                                                    <span className="text-xs font-medium">{agent.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-neutral-900 tracking-tighter">₹{(agent.agentProfile?.totalEarnings || 0).toLocaleString()}</span>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Total Earnings</span>
                                                </div>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest",
                                                    getTierColor(deriveTier(agent.agentProfile?.totalEarnings || 0))
                                                )}>
                                                    {deriveTier(agent.agentProfile?.totalEarnings || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Select
                                                disabled={updatingStatusId === agent._id}
                                                value={agent.status}
                                                onValueChange={(value) => handleStatusUpdate(agent._id, value)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-32 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    statusOptions.find(opt => opt.value === agent.status)?.color || "bg-neutral-50 text-neutral-500"
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                                    {statusOptions.map(option => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-neutral-50"
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2.5 bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-neutral-200 text-neutral-400 hover:text-neutral-900 rounded-lg transition-all active:scale-95 group">
                                                    <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button className="p-2.5 bg-neutral-50 hover:bg-emerald-50 border border-neutral-100 hover:border-emerald-200 text-neutral-400 hover:text-emerald-700 rounded-lg transition-all active:scale-95 group">
                                                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">
                        <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900 tracking-wide uppercase">Add New Agent</h3>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Register a new agent executive</p>
                            </div>
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="p-3 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 text-neutral-400 hover:text-neutral-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterAgent} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Jane"
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
                                            value={regData.firstName}
                                            onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Doe"
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
                                            value={regData.lastName}
                                            onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="agent@salon.com"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
                                        value={regData.email}
                                        onChange={e => setRegData({ ...regData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91..."
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
                                            value={regData.phone}
                                            onChange={e => setRegData({ ...regData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-neutral-200"
                                            value={regData.password}
                                            onChange={e => setRegData({ ...regData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={regLoading}
                                className="w-full py-4 bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {regLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        SAVE AGENT
                                        <ArrowUpRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
