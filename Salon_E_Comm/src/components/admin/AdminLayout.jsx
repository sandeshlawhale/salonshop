import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../common/AppSidebar';
import DashboardHeader from '../common/DashboardHeader';
import { TooltipProvider } from '../ui/tooltip';

export default function AdminLayout({ children, title = 'Dashboard' }) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-neutral-50/50 print:bg-white print:min-h-0">
                    <AppSidebar role="ADMIN" />
                    <SidebarInset className="flex flex-col bg-neutral-50/50 print:bg-white">
                        <DashboardHeader title={title} />
                        <main className="flex-1 p-4 md:p-6 print:p-0">
                            <div className="mx-auto w-full max-w-7xl">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}
