import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { settingsAPI } from '@/utils/apiClient';

export default function AuthHeader({ title, subtitle }) {
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsAPI.get();
                if (data?.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className='space-y-1'>
            {logoUrl ? (
                <div className="w-16 h-16 mb-2">
                    <img src={logoUrl} alt="Salon Logo" className="w-full h-full object-contain rounded-md" />
                </div>
            ) : (
                <div className="w-12 h-12 bg-neutral-900 rounded-md flex items-center justify-center text-white mb-2">
                    <Sparkles size={24} />
                </div>
            )}
            <h1 className="text-3xl text-neutral-900 tracking-tighter">{title}</h1>
            <p className="text-neutral-500 font-medium">{subtitle}</p>
        </div>
    );
}
