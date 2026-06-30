import React from 'react';

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
                {/* Section Title */}
                <div className="mb-10">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent-green font-medium mb-2 block">
                        {lang === 'es' ? 'Explorar la Biblioteca' : lang === 'pt' ? 'Explorar a Biblioteca' : 'Explore the Library'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-light text-primary-dark dark:text-white tracking-tight">
                        {lang === 'es' ? 'Clases Taxonómicas' : lang === 'pt' ? 'Classes Taxonômicas' : 'Taxonomic Classes'}
                    </h2>
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

                        return (
                            <a
                                key={cls.id}
                                href={`/${lang}/species?class=${cls.id}`}
                                className="group relative flex flex-col items-center justify-between p-4 transition-all duration-300"
                            >
                                {/* Transparent PNG Image Container */}
                                <div className="flex-1 flex items-center justify-center w-full min-h-[200px] relative">
                                    {popoutImg && (
                                        <img
                                            src={popoutImg}
                                            alt={name}
                                            className="relative z-10 w-48 h-48 object-contain drop-shadow-md group-hover:scale-[1.06] group-hover:-translate-y-1.5 transition-all duration-500"
                                        />
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="w-full text-center space-y-1 mt-4">
                                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight group-hover:text-accent-green transition-colors">
                                        {name}
                                    </h3>
                                    <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400 uppercase tracking-widest block">
                                        {cls.count} {lang === 'es' ? 'Especies' : lang === 'pt' ? 'Espécies' : 'Species'}
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
