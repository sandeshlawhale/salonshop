import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { TooltipProvider } from '../ui/tooltip';

export default function AdminLayout({ children, title = 'Dashboard' }) {
    return (
        <TooltipProvider>
            <div className="flex min-h-screen bg-neutral-50/50">
                <AdminSidebar />
                <div className="flex-1 ml-64 flex flex-col">
                    <AdminHeader title={title} />
                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
