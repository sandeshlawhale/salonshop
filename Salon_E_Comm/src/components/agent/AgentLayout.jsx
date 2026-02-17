import React from 'react';
import AgentSidebar from './AgentSidebar';
import { TooltipProvider } from '../ui/tooltip';

export default function AgentLayout({ children, title = 'Agent Portal' }) {
    return (
        <TooltipProvider>
            <div className="flex min-h-screen bg-neutral-50/50 print:bg-white print:min-h-0">
                <div className="print:hidden">
                    <AgentSidebar />
                </div>
                <div className="flex-1 ml-64 flex flex-col print:ml-0 print:block">
                    <main className="p-8 print:p-0">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
