import React from 'react';
import { type translations } from '../../i18n/data';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { landingImages } from '../../config/landingImages';

interface HeroProps {
    content: typeof translations.es.hero;
    lang: string;
}

export const Hero: React.FC<HeroProps> = ({ content, lang }) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const query = formData.get('q');
        window.location.href = `/${lang}/species?q=${encodeURIComponent(query as string)}`;
    };

    return (
        <section className="relative w-full h-[65vh] min-h-[480px] flex items-center bg-black overflow-hidden font-sans">
            {/* Background Image with Cinematic Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={landingImages.hero.src}
                    alt={landingImages.hero.alt}
                    className="w-full h-full object-cover opacity-60 scale-115 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
                <div className="container mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl text-white tracking-tighter max-w-4xl font-light">
                            {content.titles_animate[0].split('|')[0].trim()}
                            <span className="text-accent-green opacity-90 font-light">
                                {' '} {content.titles_animate[0].split('|')[1]?.trim() || 'Portal'}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-sm md:text-lg text-gray-300 max-w-2xl leading-relaxed font-light"
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
                                className="w-full h-14 pl-14 pr-32 bg-transparent text-white outline-none placeholder:text-gray-500 font-light"
                            />
                            <button className="absolute right-2 bg-accent-green hover:bg-accent-green/90 text-white px-6 py-2 rounded-full transition-colors font-light cursor-pointer">
                                {lang === 'es' ? 'Buscar' : 'Search'}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>

            <style>{`
                @keyframes slow-zoom {
                    from { transform: scale(1.15); }
                    to { transform: scale(1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s ease-in-out infinite alternate;
                }
            `}</style>
        </section>
    );
};


