import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export default function AdminHeader({ title }) {
    return (
        <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{title}</h2>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-64 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
