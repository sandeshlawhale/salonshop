import React, { useEffect } from 'react';
import FAQSection from '../components/home/FAQSection';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">

            {/* Hero / Header Section */}
            <div className="relative py-20 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <HelpCircle size={14} />
                        <span>Support & Help</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter uppercase leading-none mb-6">
                        Help <span className="text-primary">Center.</span>
                    </h1>
                    <p className="text-neutral-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Everything you need to know about our products, shipping, and professional salon services.
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="">
                <FAQSection />
            </div>

            {/* Contact CTA */}
            <div className="max-w-3xl mx-auto px-4 mt-20 text-center space-y-8">
                <div className="h-px w-24 bg-primary/20 mx-auto" />
                <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Still have questions?</h3>
                <p className="text-neutral-500 font-medium">
                    If you couldn't find the answer you were looking for, our professional support team is ready to assist you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button className="h-12 px-10 rounded-lg bg-neutral-900 text-white font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200">
                        Contact Support
                    </button>
                    <button className="h-12 px-10 rounded-lg bg-white border border-neutral-200 text-neutral-900 font-black text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all">
                        Send us a Message
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
