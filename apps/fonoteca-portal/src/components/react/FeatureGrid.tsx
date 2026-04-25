import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FeatureItem {
    title: string;
    description: string;
}

interface FeatureGridProps {
    data: {
        title: string;
        items: FeatureItem[];
    };
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ data }) => {
    // Memoize the items to ensure stable rendering
    const items = useMemo(() => data.items, [data.items]);

    return (
        <section className="py-24 bg-[#050514]">
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h4 className="text-indigo-500 font-mono uppercase tracking-[0.2em] text-xs mb-4">
                        WHAT WE DO
                    </h4>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-primary-dark dark:text-white font-light leading-tight">
                        {data.title.split(',').map((part, index) => (
                            <span key={index} className="block">
                                {part.trim()}{index < 1 ? ',' : ''}
                            </span>
                        ))}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.slice(0, 5).map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-[#0b0c1b] border border-[#1e1b4b] rounded-2xl p-8 flex flex-col justify-between min-h-[300px] hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-300 group"
                        >
                            <h3 className="text-xl font-medium text-white mb-4 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-auto">
                                {item.description}
                            </p>
                            <div className="mt-8 flex justify-between items-center">
                                <div className="text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Explore <span aria-hidden="true">&rarr;</span></div>
                                <div className="w-10 h-10 rounded-full bg-[#161633] flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* Featured / Accent Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-gradient-to-br from-indigo-600 to-purple-800 border border-indigo-400/30 rounded-2xl p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden"
                    >
                         {/* Abstract glowing shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
                        
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-2xl font-semibold text-white mb-4">Start your discovery</h3>
                            <p className="text-indigo-100/80 text-sm leading-relaxed mb-auto">
                                Access our full database of Amazonian soundscapes and integrate our API into your research.
                            </p>
                            <div className="mt-8">
                                <button className="px-6 py-2.5 bg-white text-indigo-900 rounded-full text-sm font-bold shadow-lg hover:shadow-white/20 hover:scale-105 transition-all">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
