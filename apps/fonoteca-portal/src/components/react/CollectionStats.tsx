import React from 'react';
import { type translations } from '../../i18n/data';
import { Mic, Bird, Layers, Sliders, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollectionStatsProps {
    lang: string;
    stats?: {
        recordings: number;
        species: number;
        families: number;
        orders: number;
        classes: number;
    };
    statsContent: typeof translations.es.stats;
}

export const CollectionStats: React.FC<CollectionStatsProps> = ({ lang, stats, statsContent }) => {
    // Map stats counts with live database values
    const metrics = [
        { 
            label: statsContent.s1.label, 
            value: stats?.recordings || 0, 
            desc: statsContent.s1.desc,
            icon: Mic
        },
        { 
            label: statsContent.s2.label, 
            value: stats?.species || 0, 
            desc: statsContent.s2.desc,
            icon: Bird
        },
        { 
            label: statsContent.s3.label, 
            value: stats?.families || 0, 
            desc: statsContent.s3.desc,
            icon: Layers
        },
        { 
            label: statsContent.s4.label, 
            value: stats?.orders || 0, 
            desc: statsContent.s4.desc,
            icon: Sliders
        },
        { 
            label: statsContent.s5.label, 
            value: stats?.classes || 0, 
            desc: statsContent.s5.desc,
            icon: Hash
        },
    ];

    const contentText = {
        es: {
            label: "Colección Científica",
            title: "Explora la riqueza sonora de la Amazonía",
            desc: "A través de sus diferentes clases taxonómicas. Cada grabación es un testimonio único de la vida silvestre."
        },
        en: {
            label: "Scientific Collection",
            title: "Explore the sonic richness of the Amazon",
            desc: "Through its different taxonomic classes. Each recording is a unique testimony of wildlife."
        },
        pt: {
            label: "Coleção Científica",
            title: "Explore a riqueza sonora da Amazônia",
            desc: "Através de suas diferentes classes taxonômicas. Cada gravação é um testemunho único da vida selvagem."
        }
    };

    const t = contentText[lang as 'es' | 'en' | 'pt'] || contentText.es;

    return (
        <section className="py-24 bg-white dark:bg-[#0c141d] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 font-sans">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                {/* 1. About the Collection Section (Image 1 Inspiration) */}
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-24">
                    {/* Left Column: Text */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent-green font-medium mb-4 block">
                            {t.label}
                        </span>
                        
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-primary-dark dark:text-white mb-6 leading-tight tracking-tight">
                            {t.title}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed font-light">
                            {t.desc}
                        </p>
                    </div>

                    {/* Right Column: Styled Image */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative">
                            {/* Decorative background grid/dots resembling Image 1 */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 opacity-25 dark:opacity-40 z-0 pointer-events-none">
                                <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="2" fill="currentColor" className="text-accent-green" />
                                    </pattern>
                                    <rect width="100%" height="100%" fill="url(#dots)" />
                                </svg>
                            </div>
                            
                            <div className="absolute inset-0 bg-accent-green/5 dark:bg-accent-green/10 rounded-3xl transform translate-x-3 translate-y-3 -z-10"></div>
                            
                            <img
                                src="https://www.actualidadambiental.pe/wp-content/uploads/2018/08/investigadores-en-madre-de-dios_thomas-muller-1.jpg"
                                alt={t.title}
                                className="relative z-10 w-full h-[380px] md:h-[450px] object-cover rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Separator Line */}
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-20"></div>

                {/* 2. Collection Statistics Section (Image 3 Inspiration) */}
                <div>
                    <div className="mb-12">
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent-green font-medium mb-3 block">
                            {lang === 'es' ? 'Estadísticas de la Fonoteca' : lang === 'pt' ? 'Estatísticas da Fonoteca' : 'Sound Library Statistics'}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-light text-primary-dark dark:text-white tracking-tight">
                            {lang === 'es' ? 'La colección en cifras' : lang === 'pt' ? 'A coleção em números' : 'The collection in numbers'}
                        </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
                        {metrics.map((metric, i) => {
                            const Icon = metric.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="space-y-4"
                                >
                                    {/* Icon Container (Lime green / Accent green subtle square from Image 3) */}
                                    <div className="w-12 h-12 rounded-xl bg-accent-green/10 dark:bg-accent-green/20 flex items-center justify-center text-accent-green">
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-3xl md:text-4xl font-light text-primary-dark dark:text-white tracking-tight">
                                            {metric.value.toLocaleString()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-primary-dark dark:text-white tracking-wide">
                                                {metric.label}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal font-light">
                                                {metric.desc}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
