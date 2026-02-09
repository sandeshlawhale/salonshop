import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    UserCircle,
    LogOut,
    Gift,
    DollarSign,
    Briefcase,
    Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/agent-dashboard' },
    { icon: ShoppingBag, label: 'My Orders', path: '/agent-dashboard/orders' },
    { icon: Users, label: 'My Customers', path: '/agent-dashboard/customers' },
    { icon: DollarSign, label: 'Earnings', path: '/agent-dashboard/payouts' },
    { icon: Bell, label: 'Notifications', path: '/agent-dashboard/notifications' },
    { icon: UserCircle, label: 'Profile', path: '/agent-dashboard/profile' },
];

export default function AgentSidebar() {
    const { logout, user } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-sm">
            <div className="p-8 pb-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <span className="text-white font-black text-xl">S</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-neutral-900 tracking-tighter leading-none">SALON</h1>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Agent Panel</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/agent-dashboard'}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group
              ${isActive
                                ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}
            `}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-neutral-50 bg-neutral-50/30">
                <div className="p-4 bg-white rounded-2xl mb-4 border border-neutral-100 shadow-sm">
                    <p className="text-[8px] font-black text-neutral-400 border-b border-neutral-50 pb-2 mb-2 uppercase tracking-[0.2em]">Level Status</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-100">
                            {user?.agentProfile?.tier?.[0] || 'B'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-neutral-900 truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[9px] font-bold text-emerald-600 truncate uppercase tracking-widest">{user?.agentProfile?.tier || 'Bronze'} Tier</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Session</span>
                </button>
            </div>
        </aside>
    );
}
