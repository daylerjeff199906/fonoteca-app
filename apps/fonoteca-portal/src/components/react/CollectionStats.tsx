import React from 'react';
import { type translations } from '../../i18n/data';
import { ArrowUpRight } from 'lucide-react';

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
    const metrics = [
        { label: statsContent.s1.label, value: stats?.recordings || 0 },
        { label: statsContent.s2.label, value: stats?.species || 0 },
        { label: statsContent.s3.label, value: stats?.families || 0 },
        { label: statsContent.s4.label, value: stats?.orders || 0 },
        { label: statsContent.s5.label, value: stats?.classes || 0 },
    ];

    const contentText = {
        es: {
            label: "Colección Científica",
            title: "Explora la riqueza sonora de la Amazonía",
            desc: "Un archivo bioacústico estructurado por clases taxonómicas, destinado al monitoreo ecológico y la investigación de la biodiversidad amazónica a través de sus firmas sonoras."
        },
        en: {
            label: "Scientific Collection",
            title: "Explore the sonic richness of the Amazon",
            desc: "A bioacoustic archive structured by taxonomic classes, designed for ecological monitoring and research of Amazonian biodiversity through sound signatures."
        },
        pt: {
            label: "Coleção Científica",
            title: "Explore a riqueza sonora da Amazônia",
            desc: "Um arquivo bioacústico estruturado por classes taxonômicas, destinado ao monitoramento ecológico e à pesquisa da biodiversidade amazônica por meio de assinaturas sonoras."
        }
    };

    const t = contentText[lang as 'es' | 'en' | 'pt'] || contentText.es;

    return (
        <section className="py-24 bg-white dark:bg-[#0c141d] border-b border-gray-50 dark:border-gray-800/60 transition-colors duration-300 font-sans">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left Column: Text + Integrated Stats */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1 space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent-green font-medium block">
                                {t.label}
                            </span>
                            
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-primary-dark dark:text-white leading-tight tracking-tight">
                                {t.title}
                            </h2>

                            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed font-light">
                                {t.desc}
                            </p>
                        </div>

                        {/* Consolidated minimalist stats (no icons, no borders, light font) */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-6 pt-8 border-t border-gray-100 dark:border-gray-800/80">
                            {metrics.map((metric, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="text-2xl md:text-3xl font-light text-primary-dark dark:text-white tracking-tight">
                                        {metric.value.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal uppercase tracking-wider leading-tight">
                                        {metric.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Link to view detailed statistics */}
                        <div className="pt-4">
                            <a
                                href={`/${lang}/stats`}
                                className="group inline-flex items-center text-sm text-primary-dark dark:text-white font-normal border-b border-accent-green hover:text-accent-green transition-colors pb-1"
                            >
                                {lang === 'es' ? 'Ver estadísticas detalladas' : lang === 'pt' ? 'Ver estatísticas detalhadas' : 'View detailed statistics'}
                                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Styled Feature Image */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative">
                            {/* Decorative background grid/dots */}
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
                                className="relative z-10 w-full h-[380px] md:h-[480px] object-cover rounded-3xl shadow-md border border-gray-100 dark:border-gray-800/80 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
