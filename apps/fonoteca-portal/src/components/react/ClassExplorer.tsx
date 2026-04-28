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

interface ClassData {
    id: string;
    label_name: string | null;
    icon: string | null;
    image_url: string | null;
    count: number;
}

interface ClassExplorerProps {
    lang: string;
    classes: ClassData[];
}

export const ClassExplorer: React.FC<ClassExplorerProps> = ({ lang, classes }) => {
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
            button: "Ver todas las especies"
        }
    };

    const t = classTranslations[lang] || classTranslations.es;

    // Filter classes to show only those with count > 0
    const displayClasses = classes.filter(c => c.count > 0).slice(0, 4);

    return (
        <section className="py-20 bg-white dark:bg-[#04070a] overflow-hidden">
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
                                src="https://www.actualidadambiental.pe/wp-content/uploads/2018/08/investigadores-en-madre-de-dios_thomas-muller-1.jpg"
                                alt="Forest ambience"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </motion.div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayClasses.map((cls, idx) => {
                        // Safe JSON parsing for label_name
                        let labelObj: any = null;
                        try {
                            labelObj = typeof cls.label_name === 'string' && cls.label_name.startsWith('{')
                                ? JSON.parse(cls.label_name)
                                : cls.label_name;
                        } catch (e) {
                            labelObj = cls.label_name;
                        }

                        const name = (typeof labelObj === 'object' && labelObj !== null)
                            ? (labelObj[lang] || labelObj['es'] || cls.id || idx.toString())
                            : (labelObj || cls.id || idx.toString());

                        const popoutImg = cls.image_url || undefined;
                        const isPopOut = true;

                        if (isPopOut) {
                            return (
                                <motion.a
                                    key={cls.id}
                                    href={`/${lang}/species?class=${cls.id}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                                    whileHover={{ y: -5 }}
                                    className="group relative h-80 flex flex-col justify-end p-8 rounded-[3.5rem] bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/10 hover:border-primary/40 transition-all mt-16 mb-4"
                                >
                                    {/* 3D Pop-out Image - Uses image_url */}
                                    <motion.img
                                        src={popoutImg}
                                        alt={name}
                                        initial={{ y: 20, opacity: 0, scale: 0.9 }}
                                        whileInView={{ y: -80, opacity: 1, scale: 1.2 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 + 0.4, duration: 1, type: "spring" }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.7)] z-20 pointer-events-none transition-transform duration-500"
                                    />

                                    <div className="relative z-10 text-center">
                                        <h3 className="text-2xl font-bold text-white tracking-tighter mb-1">
                                            {name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                            <span>{cls.count} {lang === 'es' ? 'Especies' : 'Species'}</span>
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Decorative Blur Circle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                                </motion.a>
                            );
                        }

                        // Variant 1: Modern Glass (Simplified, no icon)
                        return (
                            <motion.a
                                key={cls.id}
                                href={`/${lang}/species?class=${cls.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group h-80 p-8 rounded-[3.5rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-center items-center overflow-hidden relative text-center mt-16 mb-4"
                            >
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-4xl font-bold text-white tracking-tighter leading-tight">
                                        {name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium group-hover:text-primary transition-colors">
                                        <span>{cls.count} {lang === 'es' ? 'Especies' : 'Species'}</span>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative elements for the glass card */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
