import React, { useState } from 'react';
import {
    Bell,
    Package,
    CreditCard,
    MessageSquare,
    Tag,
    CheckCircle2,
    Clock,
    Trash2,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'order',
            title: 'Order Confirmed',
            message: 'Your order #ORD-7721 has been confirmed and is being prepared.',
            time: '2 hours ago',
            read: false,
            icon: Package,
            color: 'blue'
        },
        {
            id: 2,
            type: 'payment',
            title: 'Payout Successful',
            message: 'Your commission payout of ₹4,500 has been credited to your wallet.',
            time: '5 hours ago',
            read: true,
            icon: CreditCard,
            color: 'emerald'
        },
        {
            id: 3,
            type: 'promotion',
            title: 'New Tier Unlocked!',
            message: 'Congratulations! You have reached "Silver" agent status. Enjoy higher commissions.',
            time: '1 day ago',
            read: false,
            icon: Sparkles,
            color: 'amber'
        },
        {
            id: 4,
            type: 'system',
            title: 'Profile Verified',
            message: 'Your salon credentials has been verified by the admin team.',
            time: '2 days ago',
            read: true,
            icon: CheckCircle2,
            color: 'emerald'
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-neutral-900 tracking-tight">System <span className="text-emerald-600">Notifications</span></h1>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Stay updated with your professional activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={markAllRead}
                            className="rounded-xl border-neutral-200 text-[10px] font-black uppercase tracking-widest px-6 h-12 hover:bg-white active:scale-[0.98] transition-all"
                        >
                            Mark all as read
                        </Button>
                        <Button
                            className="rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-lg shadow-neutral-900/20 active:scale-[0.98] transition-all"
                        >
                            Preferences
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`group relative bg-white p-6 rounded-[32px] border ${notif.read ? 'border-neutral-100' : 'border-emerald-100 bg-emerald-50/10'} shadow-sm hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-500`}
                            >
                                {!notif.read && (
                                    <div className="absolute top-6 right-6 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                )}

                                <div className="flex gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notif.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        notif.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                        <notif.icon size={24} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className={`font-black uppercase tracking-tight ${notif.read ? 'text-neutral-900' : 'text-emerald-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                <Clock size={10} />
                                                {notif.time}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-neutral-500 leading-relaxed max-w-2xl">
                                            {notif.message}
                                        </p>

                                        <div className="mt-4 flex items-center gap-4">
                                            <button className="text-[10px] font-black text-neutral-900 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                                View Details <ChevronRight size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteNotification(notif.id)}
                                                className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={12} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-100">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                <Bell size={40} />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-widest mb-2">Clean Slate</h3>
                            <p className="text-neutral-400 font-bold">You're all caught up with your notifications.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 p-8 bg-neutral-900 rounded-[40px] border border-neutral-800 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-black tracking-tight mb-2">Automated Procurement?</h3>
                            <p className="text-neutral-400 text-sm font-semibold max-w-md">Enable smart notifications to get alerted when your best-selling professional inventory is running low.</p>
                        </div>
                        <Button className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border-none">
                            Configure Alerts
                        </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                </div>
            </div>
        </div>
    );
}
