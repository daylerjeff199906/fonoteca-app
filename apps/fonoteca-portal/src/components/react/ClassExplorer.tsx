import React from 'react';
import {
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
    // Filter classes to show only those with count > 0
    const displayClasses = classes.filter(c => c.count > 0);

    return (
        <section className="pb-24 bg-white dark:bg-[#0c141d] overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pt-4">
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

                        return (
                            <a
                                key={cls.id}
                                href={`/${lang}/species?class=${cls.id}`}
                                className="group relative h-64 flex flex-col justify-end p-8 rounded-[3rem] bg-gradient-to-br from-[#0c141d] to-[#04070a] border border-white/5 hover:border-primary/40 transition-all duration-500 mt-12 mb-4"
                            >
                                {/* 3D Pop-out Image - Dramatic emerging effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-20">
                                    <img
                                        src={popoutImg}
                                        alt={name}
                                        className="w-56 h-56 mx-auto object-contain drop-shadow-[0_45px_55px_rgba(0,0,0,0.9)] -translate-y-[100px] scale-[1.35] group-hover:scale-[1.45] transition-transform duration-700"
                                    />
                                </div>

                                {/* Content Area - Left Aligned */}
                                <div className="relative z-30 flex flex-col items-start text-left space-y-4">
                                    <div className="space-y-1 w-full">
                                        <h3 className="text-4xl font-bold text-white tracking-tighter leading-none group-hover:text-primary transition-colors">
                                            {name}
                                        </h3>
                                        <div className="h-1.5 w-0 bg-primary group-hover:w-16 transition-all duration-500 rounded-full"></div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full">
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-[0.2em] transition-colors">
                                                {cls.count} {lang === 'es' ? 'Especies' : 'Species'}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-500 ml-auto">
                                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/15 transition-all duration-700"></div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
