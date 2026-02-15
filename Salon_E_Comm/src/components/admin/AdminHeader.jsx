import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Check, Trash2, Clock, MailOpen, User, Info, AlertCircle, ShoppingBag } from 'lucide-react';
import { notificationAPI } from '../../services/apiService';
import { formatDistanceToNow } from 'date-fns';

export default function AdminHeader({ title }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationAPI.getAll();
            const data = res.data?.notifications || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
            case 'USER': return <User className="w-4 h-4 text-emerald-500" />;
            case 'ALERT': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm transition-all duration-300">
            <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">{title}</h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all w-72 text-xs font-bold"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`p-3 rounded-2xl transition-all relative group ${isNotificationOpen ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
                        >
                            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-4 w-96 bg-white border border-neutral-100 rounded-[32px] shadow-2xl shadow-neutral-900/10 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="p-6 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                                    <div>
                                        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Notifications</h3>
                                        <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">System Updates & Alerts</p>
                                    </div>
                                    <button
                                        onClick={markAllRead}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                        title="Mark all as read"
                                    >
                                        <MailOpen className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {loading && notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Retrieving Signals...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <Bell className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-loose">The console is clear.<br />No new directives.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-neutral-50">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                                    className={`p-6 flex gap-4 hover:bg-neutral-50 transition-all cursor-pointer relative group ${!n.isRead ? 'bg-emerald-50/30' : ''}`}
                                                >
                                                    {!n.isRead && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                                                    )}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'bg-neutral-50'}`}>
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className={`text-xs font-black truncate ${!n.isRead ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                                                {n.title}
                                                            </h4>
                                                            <span className="text-[9px] font-bold text-neutral-400 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${!n.isRead ? 'text-neutral-600 font-bold' : 'text-neutral-400 font-medium'}`}>
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-neutral-50/50 border-t border-neutral-50 text-center">
                                    <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-neutral-900 transition-colors">
                                        View All Connectivity
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="p-3 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-2xl transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-neutral-100 mx-1" />

                    <button className="flex items-center gap-3 p-1.5 pl-3 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-emerald-200 transition-all group">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-neutral-900 uppercase tracking-tighter leading-none">Command Center</span>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">Status: Active</span>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-50 transition-colors">
                            <User className="text-neutral-400 group-hover:text-emerald-600" size={20} />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
