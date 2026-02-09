import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-600',
        emerald: 'bg-emerald-600',
        amber: 'bg-amber-600',
        rose: 'bg-rose-600',
        neutral: 'bg-neutral-900',
    };

    const bgClasses = {
        blue: 'bg-blue-50',
        emerald: 'bg-emerald-50',
        amber: 'bg-amber-50',
        rose: 'bg-rose-50',
        neutral: 'bg-neutral-50',
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        rose: 'text-rose-600',
        neutral: 'text-neutral-900',
    };

    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-neutral-100 hover:shadow-2xl hover:shadow-neutral-600/5 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${bgClasses[color]} ${iconColorClasses[color]} border border-transparent group-hover:border-current shadow-sm transition-all duration-500`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{title}</p>
                <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
