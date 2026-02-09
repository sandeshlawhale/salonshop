import React from 'react';
import AgentSidebar from './AgentSidebar';
import AdminHeader from '../admin/AdminHeader'; // Reusing AdminHeader as it's generic enough

export default function AgentLayout({ children, title = 'Agent Portal' }) {
    return (
        <div className="flex min-h-screen bg-neutral-50/50">
            <AgentSidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <AdminHeader title={title} />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
