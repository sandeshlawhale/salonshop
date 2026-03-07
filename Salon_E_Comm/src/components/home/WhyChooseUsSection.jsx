import React from 'react';
import { Truck, Lock, ShieldCheck } from 'lucide-react';

const WhyChooseUsSection = () => (
    <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight">Why Choose SalonE-Comm?</h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">Premium products, smart commission tracking, and fast delivery — all in one platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { icon: <Truck size={32} />, title: "Fast Delivery", description: "We guarantee 24-hour dispatch for all professional salon orders." },
                    { icon: <Lock size={32} />, title: "Secure Payments", description: "Pay safely with trusted and encrypted payment methods." },
                    { icon: <ShieldCheck size={32} />, title: "Trusted Quality", description: "Quality-tested products from verified brands you can trust." }
                ].map((feature, i) => (
                    <div key={i} className="group relative">
                        <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
                        <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full hover:border-emerald-100 transition-colors">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                                {feature.icon}
                            </div>
                            <h3 className="text-3xl font-black mb-3 -tracking-tight text-neutral-900">{feature.title}</h3>
                            <p className="text-neutral-500 text-base leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default WhyChooseUsSection;
