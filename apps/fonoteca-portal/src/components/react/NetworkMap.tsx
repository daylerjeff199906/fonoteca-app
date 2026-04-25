import React from 'react';
import { motion } from 'framer-motion';

export const NetworkMap: React.FC = () => {
    // Simulated locations (dots) based on the provided image
    const locations = [
        { top: '45%', left: '23%', label: 'Iquitos' },
        { top: '48%', left: '26%', label: 'Yurimaguas' },
        { top: '55%', left: '25%', label: 'Pucallpa' },
        { top: '51%', left: '55%', label: 'Loreto' },
        { top: '65%', left: '78%', label: 'Madre de Dios' },
    ];

    return (
        <section className="relative py-24 bg-[#04070a] overflow-hidden">
            {/* Background grid/Tech lines (Simulated map) */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
                {/* Simplified Tech World Map SVG with lines */}
                <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full object-cover select-none"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <pattern id="line-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
                        </pattern>
                        <mask id="world-mask">
                            {/* Simple representation of continents with Tech styling */}
                            <path 
                                d="M250,150 Q280,140 310,160 T350,180 T400,200 L420,250 L400,350 L350,450 L300,500 L250,450 L220,350 L200,250 Z" 
                                fill="white" 
                                className="opacity-100"
                            />
                            {/* South America (Simplified) */}
                            <path d="M280,300 L350,320 L400,400 L380,550 L300,550 L250,450 Z" fill="white" />
                            {/* Africa (Simplified) */}
                            <path d="M450,250 L550,260 L600,350 L580,480 L500,500 L430,400 Z" fill="white" />
                            {/* Eurasia (Simplified) */}
                            <path d="M450,100 L850,80 L900,250 L700,350 L500,300 Z" fill="white" />
                            {/* Australia (Simplified) */}
                            <path d="M780,450 L880,440 L900,520 L800,550 Z" fill="white" />
                        </mask>
                    </defs>
                    
                    {/* The Background Lines */}
                    <rect width="100%" height="100%" fill="url(#line-pattern)" mask="url(#world-mask)" />
                    
                    {/* Glowing effect for continents */}
                    <rect width="100%" height="100%" fill="rgba(255,255,255,0.02)" mask="url(#world-mask)" />
                </svg>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                {/* Map Pins Container */}
                <div className="relative max-w-5xl mx-auto h-[400px] md:h-[600px] border border-white/5 bg-white/[0.01] rounded-3xl backdrop-blur-sm">
                    {/* Corner accents for DB look */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-accent-green/40 rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-accent-green/40 rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-accent-green/40 rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent-green/40 rounded-br-3xl"></div>

                    {locations.map((loc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="absolute z-20 group"
                            style={{ top: loc.top, left: loc.left }}
                        >
                            <div className="relative">
                                {/* Crosshair lines */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-px bg-accent-green/30 group-hover:w-10 transition-all duration-300"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-accent-green/30 group-hover:h-10 transition-all duration-300"></div>
                                
                                {/* Center Dot */}
                                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] relative z-10"></div>
                                
                                {/* Coordinates Label (Technical look) */}
                                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <span className="text-[9px] font-mono text-accent-green uppercase tracking-tighter opacity-80 mb-0.5">
                                        ID: 0{i+1}
                                    </span>
                                    <span className="bg-[#0a0f16]/90 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded-sm text-[10px] text-white font-mono whitespace-nowrap shadow-xl">
                                        {loc.label}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.33); }
                    80%, 100% { opacity: 0; }
                }
            `}</style>
        </section>
    );
};
