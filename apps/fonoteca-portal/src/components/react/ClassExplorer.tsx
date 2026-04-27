import React from 'react';
import { motion } from 'framer-motion';
import { 
    Bird, 
    Bug, 
    Fish, 
    Waves, 
    Dog, 
    Zap,
    ArrowRight
} from 'lucide-react';

interface ClassExplorerProps {
    lang: string;
    classes: any[];
}

export const ClassExplorer: React.FC<ClassExplorerProps> = ({ lang, classes }) => {
    // Mapping of class names to icons (placeholders)
    const iconMap: Record<string, any> = {
        'Amphibia': Waves,
        'Aves': Bird,
        'Mammalia': Dog,
        'Insecta': Bug,
        'Reptilia': Zap, // Placeholder for reptile
        'Actinopterygii': Fish,
    };

    const classTranslations: Record<string, any> = {
        es: {
            title: "Nuestra Diversidad Biológica",
            subtitle: "Explora la riqueza sonora de la Amazonía a través de sus diferentes clases taxonómicas. Cada grabación es un testimonio único de la vida silvestre.",
            button: "Ver todas las especies"
        },
        en: {
            title: "Our Biological Diversity",
            subtitle: "Explore the sonic richness of the Amazon through its different taxonomic classes. Each recording is a unique testimony of wildlife.",
            button: "View all species"
        },
        pt: {
            title: "Nossa Diversidade Biológica",
            subtitle: "Explore a riqueza sonora da Amazônia através de suas diferentes classes taxonômicas. Cada gravação é um testemunho único da vida selvagem.",
            button: "Ver todas as espécies"
        }
    };

    const t = classTranslations[lang] || classTranslations.es;

    // Filter classes to show only those with count > 0 and limit to 4 for the grid if needed, 
    // but the image shows 4. We'll show up to 4 or 5.
    const displayClasses = classes.filter(c => c.count > 0).slice(0, 4);

    return (
        <section className="py-20 bg-white dark:bg-[#0c141d] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
                    {/* Left Side: Content */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
                        >
                            {t.title}
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed"
                        >
                            {t.subtitle}
                        </motion.p>
                    </div>

                    {/* Right Side: Feature Image */}
                    <div className="w-full lg:w-1/2">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070&auto=format&fit=crop" 
                                alt="Forest ambience"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </motion.div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayClasses.map((cls, idx) => {
                        const Icon = iconMap[cls.id] || Zap;
                        const name = lang === 'en' ? cls.title_en : lang === 'pt' ? cls.title_pt : cls.title_es;
                        
                        return (
                            <motion.a
                                key={cls.id}
                                href={`/${lang}/species?class=${cls.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group bg-[#004d40] dark:bg-[#064e3b] p-8 rounded-3xl flex flex-col gap-8 transition-all hover:shadow-xl hover:shadow-emerald-900/20"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#004d40]">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white leading-tight">
                                        {name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-emerald-100/60 text-sm font-medium group-hover:text-white transition-colors">
                                        <span>{cls.count} {lang === 'es' ? 'Especies' : 'Species'}</span>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
