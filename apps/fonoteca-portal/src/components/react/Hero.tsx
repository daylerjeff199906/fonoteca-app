import React from 'react';
import { type translations } from '../../i18n/data';
import { Search, ArrowUpRight, ArrowDownRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
    content: typeof translations.es.hero;
    lang: string;
    stats?: {
        recordings: number;
        species: number;
        families: number;
        orders: number;
        classes: number;
    };
}

export const Hero: React.FC<HeroProps> = ({ content, lang, stats }) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const query = formData.get('q');
        window.location.href = `/${lang}/species?q=${encodeURIComponent(query as string)}`;
    };

    const metrics = [
        { label: lang === 'es' ? 'Grabaciones' : 'Recordings', value: stats?.recordings || 0, unit: 'audios', trend: 'up' },
        { label: lang === 'es' ? 'Especies' : 'Species', value: stats?.species || 0, unit: 'taxa', trend: 'up' },
        { label: lang === 'es' ? 'Familias' : 'Families', value: stats?.families || 0, unit: 'grupos', trend: 'up' },
        { label: lang === 'es' ? 'Órdenes' : 'Orders', value: stats?.orders || 0, unit: 'taxa', trend: 'up' },
        { label: lang === 'es' ? 'Clases' : 'Classes', value: stats?.classes || 0, unit: 'bioma', trend: 'up' },
    ];

    return (
        <section className="relative h-screen min-h-[750px] flex flex-col bg-black overflow-hidden font-sans">
            {/* Background Image with Cinematic Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=2074&auto=format&fit=crop"
                    alt="Amazon Forest"
                    className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-20">
                <div className="container mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl text-white tracking-tighter leading-[0.9]">
                            {content.titles_animate[0].split('|')[0].trim()}
                            <span className="block text-accent-green opacity-90 font-bold">
                                {content.titles_animate[0].split('|')[1]?.trim() || 'Portal'}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-light"
                    >
                        {content.description}
                    </motion.p>

                    {/* Integrated Search */}
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-xl relative group"
                    >
                        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-accent-green/50 transition-all shadow-2xl">
                            <Search className="absolute left-6 w-5 h-5 text-gray-400 group-focus-within:text-accent-green transition-colors" />
                            <input
                                name="q"
                                type="text"
                                placeholder={lang === 'es' ? "Explorar la biblioteca..." : "Explore the library..."}
                                className="w-full h-14 pl-14 pr-32 bg-transparent text-white outline-none placeholder:text-gray-500 font-medium"
                            />
                            <button className="absolute right-2 bg-accent-green hover:bg-accent-green/90 text-white px-6 py-2 rounded-full font-bold transition-colors">
                                {lang === 'es' ? 'Buscar' : 'Search'}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>

            {/* Vital Signs / Metrics Bar */}
            <div className="relative z-10 bg-black/80 backdrop-blur-md border-t border-white/10 py-8 px-6 md:px-12 lg:px-20">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-green">VITAL SIGNS</span>
                            <div className="h-px w-20 bg-accent-green/30"></div>
                        </div>
                        <a href={`/${lang}/stats`} className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-accent-green flex items-center gap-2 transition-colors">
                            Show All <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-16">
                        {metrics.map((metric, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2 inline-block min-w-full">
                                        {metric.label}
                                    </h4>
                                    <div className="flex items-baseline gap-3 pt-2">
                                        {metric.trend === 'up' ? (
                                            <ArrowUpRight className="w-5 h-5 text-accent-green" />
                                        ) : (
                                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                                        )}
                                        <span className="text-4xl md:text-5xl font-light text-white tracking-tighter">
                                            {metric.value.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {metric.unit}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s ease-in-out infinite alternate;
                }
            `}</style>
        </section>
    );
};

