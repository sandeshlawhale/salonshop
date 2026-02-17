import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { TooltipProvider } from '../ui/tooltip';

export default function AdminLayout({ children, title = 'Dashboard' }) {
    return (
        <TooltipProvider>
            <div className="flex min-h-screen bg-neutral-50/50 print:bg-white print:min-h-0">
                <div className="print:hidden">
                    <AdminSidebar />
                </div>
                <div className="flex-1 ml-64 flex flex-col print:ml-0 print:block">
                    {/* <AdminHeader title={title} /> */}
                    <main className="p-8 print:p-0">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
