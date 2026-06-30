import React from 'react';
import { Search, Info, Play, Volume2, MapPin, Download } from 'lucide-react';

interface HowItWorksProps {
    lang: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
    const translations = {
        es: {
            label: "Guía de Exploración",
            title: "Cómo utilizar la plataforma",
            subtitle: "Aprende a buscar, reproducir y analizar las muestras de nuestro archivo acústico en cuatro sencillos pasos.",
            steps: [
                {
                    num: "1",
                    title: "Búsqueda y Filtrado",
                    desc: "Usa el buscador para localizar especies por nombre científico o común, o filtra la biblioteca por clases taxonómicas."
                },
                {
                    num: "2",
                    title: "Selección de Especie",
                    desc: "Explora la biblioteca interactiva y selecciona una especie para abrir su ficha técnica."
                },
                {
                    num: "3",
                    title: "Ficha Científica",
                    desc: "Consulta datos morfológicos detallados, mapas de distribución geográfica y registros oficiales de cada espécimen."
                },
                {
                    num: "4",
                    title: "Análisis Bioacústico",
                    desc: "Reproduce los cantos de fauna en campo, visualiza su espectrograma y solicita la descarga de archivos WAV de alta calidad."
                }
            ],
            why_title: "Por qué es importante:",
            why_desc: "Nuestra plataforma bioacústica proporciona herramientas estandarizadas para el monitoreo ecológico e investigación científica de la Amazonía."
        },
        en: {
            label: "Exploration Guide",
            title: "How to use the platform",
            subtitle: "Learn to search, play, and analyze acoustic library samples in four simple steps.",
            steps: [
                {
                    num: "1",
                    title: "Search and Filtering",
                    desc: "Use the search bar to locate specimens by scientific or common name, or filter by taxonomic classes."
                },
                {
                    num: "2",
                    title: "Select Species",
                    desc: "Browse our interactive catalog and select a species card to access its details."
                },
                {
                    num: "3",
                    title: "Scientific Sheet",
                    desc: "Review detailed morphological descriptions, geographic distribution maps, and taxonomy."
                },
                {
                    num: "4",
                    title: "Bioacoustic Analysis",
                    desc: "Play field recordings, visualize real-time spectrograms, and request high-fidelity WAV file downloads."
                }
            ],
            why_title: "Why it matters:",
            why_desc: "Our bioacoustic library provides standardized ecological monitoring tools for the conservation of Amazonian wildlife."
        },
        pt: {
            label: "Guia de Exploração",
            title: "Como usar a plataforma",
            subtitle: "Aprenda a pesquisar, reproduzir e analisar amostras do nosso arquivo acústico em quatro etapas simples.",
            steps: [
                {
                    num: "1",
                    title: "Pesquisa e Filtragem",
                    desc: "Use a barra de pesquisa para localizar espécimes por nome comum ou científico, ou filtre por classes taxonômicas."
                },
                {
                    num: "2",
                    title: "Seleção de Espécie",
                    desc: "Navegue pelo catálogo interativo e selecione um card de espécie para abrir seus detalhes."
                },
                {
                    num: "3",
                    title: "Ficha Científica",
                    desc: "Consulte dados morfológicos detalhados, mapas de distribuição geográfica e registros taxonômicos."
                },
                {
                    num: "4",
                    title: "Análise Bioacústica",
                    desc: "Reproduza cantos gravados em campo, visualize o espectrograma e solicite o download de arquivos WAV de alta fidelidade."
                }
            ],
            why_title: "Por que isso importa:",
            why_desc: "Nossa biblioteca bioacústica fornece ferramentas padronizadas para monitoramento ecológico e pesquisa científica da Amazônia."
        }
    };

    const t = translations[lang as 'es' | 'en' | 'pt'] || translations.es;

    // Static waveform bars heights for the mockup
    const waveBars = [15, 30, 25, 45, 10, 20, 35, 50, 40, 15, 25, 35, 45, 20, 15, 30, 40, 25, 10, 20, 35, 45, 15, 25];

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0c141d] border-b border-gray-100 dark:border-gray-800/60 transition-colors duration-300 font-sans">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left Column: Title and Steps List */}
                    <div className="w-full lg:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent-green font-medium block">
                                {t.label}
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-primary-dark dark:text-white leading-tight tracking-tight">
                                {t.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed font-light">
                                {t.subtitle}
                            </p>
                        </div>

                        {/* List of steps */}
                        <div className="space-y-8">
                            {t.steps.map((step) => (
                                <div key={step.num} className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-accent-green/30 dark:border-accent-green/20 flex items-center justify-center text-accent-green text-sm font-light">
                                        {step.num}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-normal text-primary-dark dark:text-white tracking-tight">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Why it matters Box */}
                        <div className="border-l-2 border-accent-green pl-6 py-1 space-y-1">
                            <h4 className="text-xs font-normal uppercase tracking-wider text-primary-dark dark:text-white">
                                {t.why_title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                                {t.why_desc}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Premium CSS UI Mockup */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-[500px] rounded-3xl bg-white dark:bg-[#16222f]/90 border border-gray-200/60 dark:border-gray-800/80 p-6 shadow-xl transition-all duration-300">
                            {/* Browser Header Mock */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-6">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-[#0c141d] px-6 py-1 rounded-md border border-gray-200/40 dark:border-gray-800/40 truncate max-w-[220px]">
                                    {lang === 'es' ? 'fonoteca.iiap.gob.pe/es/species' : 'fonoteca.iiap.gob.pe/species'}
                                </div>
                                <div className="w-8"></div>
                            </div>

                            {/* Search Mock */}
                            <div className="relative mb-6">
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-[#0c141d] border border-gray-200/40 dark:border-gray-800/40 rounded-xl text-gray-400 text-xs font-light">
                                    <Search size={14} className="text-accent-green" />
                                    <span>Phyllomedusa bicolor</span>
                                </div>
                            </div>

                            {/* Main Card Mock */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    {/* Left: Thumbnail placeholder */}
                                    <div className="w-16 h-16 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
                                        <Info size={24} />
                                    </div>
                                    {/* Right: Species titles */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-sm font-normal text-primary-dark dark:text-white italic tracking-tight">
                                            Phyllomedusa bicolor
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                                            {lang === 'es' ? 'Rana mono gigante' : lang === 'pt' ? 'Rã mono gigante' : 'Giant monkey frog'}
                                        </p>
                                    </div>
                                </div>

                                {/* Player Waveform Mockup */}
                                <div className="bg-gray-50 dark:bg-[#0c141d] rounded-2xl p-4 space-y-4 border border-gray-100 dark:border-gray-800/40">
                                    {/* Controls */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center shadow-md">
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                        <div className="flex-1 text-[10px] text-gray-400 font-mono">
                                            0:12 / 0:45
                                        </div>
                                        <Volume2 size={14} className="text-gray-400" />
                                    </div>

                                    {/* Dynamic Waveform Graph mockup */}
                                    <div className="h-14 flex items-end gap-0.5 pt-2">
                                        {waveBars.map((height, i) => (
                                            <div 
                                                key={i} 
                                                style={{ height: `${height}%` }}
                                                className={`flex-1 rounded-full ${i < 6 ? 'bg-accent-green' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Spectrogram Map Pin Mock */}
                                <div className="flex items-center justify-between text-xs pt-2 text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} className="text-accent-green" />
                                        <span>Loreto, Perú</span>
                                    </span>
                                    <span className="flex items-center gap-1 cursor-pointer hover:text-accent-green transition-colors">
                                        <Download size={12} />
                                        <span>WAV</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
