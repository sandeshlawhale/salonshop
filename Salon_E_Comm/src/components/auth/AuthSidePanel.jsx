import React from 'react';
import Plasma from "@/components/ui/plasma";
import Particles from "@/components/ui/particles";

export default function AuthSidePanel() {
    return (
        <div className="hidden lg:block w-1/2 p-2">
            <div className="h-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full">
                    <Plasma
                        color="#00bc7d"
                        speed={0.6}
                        direction="forward"
                        scale={1}
                        opacity={0.8}
                        mouseInteractive={false} />
                </div>
                <div className="absolute z-10 text-center p-12 max-w-lg pointer-events-none">
                    <h2 className="text-5xl font-semibold text-white mb-6 leading-tighter">
                        Start Your Salon Like A <span className='text-emerald-500 font-black'>PRO</span>.
                    </h2>
                </div>
            </div>
        </div>
    );
}
