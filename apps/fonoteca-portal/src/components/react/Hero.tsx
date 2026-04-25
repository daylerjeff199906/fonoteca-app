import React from 'react';
import { type translations } from '../../i18n/data';
import { Search } from 'lucide-react';

interface HeroProps {
    content: typeof translations.es.hero;
    lang: string;
    stats?: {
        recordings: number;
        species: number;
        families: number;
    };
}

const SPECTRO_DATA = [
    35, 60, 45, 80, 50, 95, 75, 40, 65, 85, 30, 55, 70, 90, 45, 60, 80, 50, 40, 75,
    60, 85, 45, 70, 90, 55, 35, 80, 50, 65, 95, 40, 75, 60, 85, 45, 70, 50, 90, 60,
    35, 65, 80, 45, 90, 60, 40, 75, 50, 85, 35, 60, 45, 80, 50, 95, 75, 40, 65, 85
];

export const Hero: React.FC<HeroProps> = ({ content, lang, stats }) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/${lang}/species`;
    };

    return (
        <section className="relative h-screen min-h-[600px] lg:max-h-[920px] flex items-center justify-center bg-[#04070a] overflow-hidden">
            {/* Background subtle effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#04070a] to-[#010203] z-0"></div>

            {/* Background Animated Spectrogram */}
            <div className="absolute inset-0 z-0 flex items-end justify-evenly opacity-15 overflow-hidden pb-10">
                {SPECTRO_DATA.map((height, i) => (
                    <div
                        key={i}
                        className="w-1 md:w-3 bg-accent-green rounded-t-full opacity-60"
                        style={{
                            height: `${height}%`,
                            animation: `spectro-bg ${1.5 + (i % 3) * 0.4}s ease-in-out infinite ${(i % 5) * 0.2}s alternate`,
                            transformOrigin: 'bottom'
                        }}
                    />
                ))}
            </div>

            {/* Gradient overlay to fade the spectrogram gently at the bottom/top */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#04070a] via-transparent to-[#04070a]"></div>
            <div className="absolute inset-0 z-0 bg-[#04070a]/40 backdrop-blur-[2px]"></div>

            {/* Content centered */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center mt-[-40px]">
                <span className="text-accent-green font-bold text-xs md:text-sm uppercase tracking-[0.4em] mb-4 animate-fade-in relative shadow-sm">
                    {lang === 'es' ? 'Bienvenido a la' : lang === 'pt' ? 'Bem-vindo à' : 'Welcome to'}
                </span>

                <div className="min-h-[160px] md:min-h-[120px] mb-8 flex items-center justify-center">
                    <h1
                        className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wide animate-fade-up leading-none flex flex-col gap-1 drop-shadow-md"
                    >
                        {content.titles_animate[0].split('|').map((part, i) => (
                            <span key={i} className="block mt-1 font-extralight tracking-tight">
                                {part.trim()}
                            </span>
                        ))}
                    </h1>
                </div>

                {/* Omnibox / Prominent Search */}
                <form
                    onSubmit={handleSearch}
                    className="w-full max-w-3xl relative animate-fade-in delay-200 mb-16"
                >
                    <div className="relative flex items-center w-full h-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-green focus-within:bg-white/10 transition-all duration-300">
                        <div className="pl-6 flex items-center justify-center text-gray-400">
                            <Search className="w-6 h-6 drop-shadow-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder={lang === 'es' ? "Buscar especies, cantos, audios..." : lang === 'pt' ? "Pesquisar espécies, cantos..." : "Search species, calls..."}
                            className="w-full h-full pl-4 pr-32 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500 font-medium"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-8 bg-accent-green hover:bg-[#19a54a] text-white font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center shadow-lg"
                        >
                            {lang === 'es' ? 'Buscar' : lang === 'pt' ? 'Buscar' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Data Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-white/70 animate-fade-in delay-300 backdrop-blur-xs">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-light text-white drop-shadow-sm">
                            {stats?.recordings.toLocaleString() || '1,250'}
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-[0.2em] mt-2 font-medium text-accent-green drop-shadow-sm">{lang === 'es' ? 'Audios' : 'Audios'}</span>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-light text-white drop-shadow-sm">
                            {stats?.species.toLocaleString() || '450'}
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-[0.2em] mt-2 font-medium text-accent-green drop-shadow-sm">{lang === 'es' ? 'Especies' : 'Species'}</span>
                    </div>
                    <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-light text-white drop-shadow-sm text-balance max-w-[120px] text-center leading-none">
                            {stats?.families.toLocaleString() || 'IIAP'}
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-[0.2em] mt-2 font-medium text-accent-green drop-shadow-sm">
                            {stats ? (lang === 'es' ? 'Familias' : 'Families') : (lang === 'es' ? 'Respaldado por' : 'Backed by')}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes spectro-bg {
                    0% { transform: scaleY(0.4); opacity: 0.3; }
                    100% { transform: scaleY(1); opacity: 1; }
                }
                .animate-fade-up { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.4s; }
            `}</style>
        </section>
    );
};

