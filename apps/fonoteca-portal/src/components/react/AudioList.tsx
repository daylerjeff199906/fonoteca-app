import React, { useState, useMemo } from 'react';
import { type Species } from '../../data/species';

interface AudioListProps {
    allSpecies: Species[];
    lang: 'es' | 'en' | 'pt';
}

interface FlattenedAudio {
    id: string; // Unique ID composed of SpeciesID + Index
    title: string;
    speciesName: string;
    scientificName: string;
    category: string;
    location: string; // Species location as proxy
    duration: string; // Placeholder
    date: string; // Placeholder
    format: string; // Placeholder
    url: string;
    mainImage: string;
    spectrogramImage?: string;
}

export const AudioList: React.FC<AudioListProps> = ({ allSpecies, lang }) => {
    // Flatten data
    const allAudios: FlattenedAudio[] = useMemo(() => {
        return allSpecies.flatMap(species =>
            species.audios.map((audio, index) => ({
                id: `${species.id}-${index}`,
                title: audio.title,
                speciesName: species[`commonName_${lang}`] as string,
                scientificName: species.scientificName,
                category: species.category,
                location: species.location,
                duration: "0:30", // Placeholder
                date: "2024", // Placeholder
                format: "MP3", // Placeholder
                url: audio.url,
                mainImage: species.mainImage,
                spectrogramImage: audio.spectrogramImage
            }))
        );
    }, [allSpecies, lang]);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Filter Logic
    const filteredAudios = allAudios.filter(audio => {
        const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audio.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audio.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || audio.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const playAudio = (audio: FlattenedAudio) => {
        const event = new CustomEvent('play-audio', {
            detail: {
                title: audio.title,
                artist: `${audio.speciesName} (${audio.scientificName})`,
                url: audio.url,
                image: audio.mainImage || '/images/logo-mini.webp',
                spectrogram: audio.spectrogramImage
            }
        });
        window.dispatchEvent(event);
    };

    const categories = ["All", ...Array.from(new Set(allAudios.map(a => a.category)))];

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-1/4 space-y-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit">
                <div>
                    <h3 className="font-bold text-primary-dark dark:text-white mb-4">Buscar</h3>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o especie..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-primary-dark dark:text-white outline-none focus:ring-2 focus:ring-accent-green"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div>
                    <h3 className="font-bold text-primary-dark dark:text-white mb-4">Categoría</h3>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-accent-green">
                                <input
                                    type="radio"
                                    name="category"
                                    className="accent-accent-green"
                                    checked={selectedCategory === cat}
                                    onChange={() => setSelectedCategory(cat)}
                                />
                                {cat === "All" ? (lang === 'es' ? 'Todas' : 'All') : cat}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Placeholder Filters */}
                <div>
                    <h3 className="font-bold text-primary-dark dark:text-white mb-4 opacity-50">Fecha (Filtro)</h3>
                    <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                </div>
            </aside>

            {/* Main List */}
            <div className="w-full lg:w-3/4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Play</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Especie</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ubicación</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Formato</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredAudios.map(audio => (
                                    <tr key={audio.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            <button
                                                onClick={() => playAudio(audio)}
                                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary-dark dark:text-white group-hover:bg-accent-green group-hover:text-white transition-all shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 fill-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="p-4 font-medium text-primary-dark dark:text-white">
                                            {audio.title}
                                            <div className="md:hidden text-xs text-gray-500 mt-1">{audio.location}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-900 dark:text-gray-200">{audio.speciesName}</div>
                                            <div className="text-sm text-gray-500 italic">{audio.scientificName}</div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">{audio.location}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-500 text-sm hidden md:table-cell">
                                            <span className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700">
                                                {audio.format}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
