import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, MapPin, ArrowRight } from 'lucide-react';
import type { Species } from '../../data/species';

interface SpeciesCardProps {
    species: Species;
    viewMode?: 'grid' | 'list';
    lang: string;
    linkToFilter?: boolean;
}

// Sub-component for media display (images/iframes)
const MediaViewer: React.FC<{
    src: string;
    alt: string;
    className: string;
    onLoaded: () => void;
    isLoaded: boolean;
    fallback?: string;
}> = ({ src, alt, className, onLoaded, isLoaded, fallback = '/images/logo-mini.webp' }) => {
    const [hasError, setHasError] = React.useState(false);

    // Auto-detect and fix drive links
    const processedSrc = React.useMemo(() => {
        if (!src) return '';
        if (src.includes('drive.google.com') || src.includes('docs.google.com')) {
            const driveIdMatch = src.match(/id=([a-zA-Z0-9_-]+)/) || src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (driveIdMatch && driveIdMatch[1]) {
                return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w800`;
            }
        }
        return src;
    }, [src]);

    if (!processedSrc || hasError) {
        return (
            <div className={`${className} bg-slate-100 dark:bg-[#0c141d] flex items-center justify-center p-8`}>
                <img
                    src={fallback}
                    className="w-20 h-20 opacity-10 filter grayscale brightness-50"
                    alt="No image available"
                    onLoad={onLoaded}
                />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-[#0c141d]">
            {!isLoaded && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse transition-opacity duration-300">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                </div>
            )}
            <img
                src={processedSrc}
                alt={alt}
                className={`${className} transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                onLoad={onLoaded}
                onError={() => setHasError(true)}
                loading="lazy"
            />
        </div>
    );
};

export const SpeciesTableRow: React.FC<SpeciesCardProps> = ({ species, lang }) => {
    const detailLink = `/${lang}/species/${species.id}`;
    const [isLoaded, setIsLoaded] = useState(false);

    const commonName = useMemo(() => {
        if (lang === 'en') return species.commonName_en;
        if (lang === 'pt') return species.commonName_pt;
        return species.commonName_es;
    }, [species, lang]);

    const onPlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (species.audios.length === 0) return;
        const audio = species.audios[0];
        const allMediaImages = [
            ...(species.galleryImages?.map(img => img.url) || []),
            ...(species.spectrograms?.map(img => img.url) || [])
        ].filter(Boolean);

        const event = new CustomEvent('play-audio', {
            detail: {
                title: audio.title || 'Canto',
                artist: `${commonName} (${species.scientificName})`,
                url: audio.url,
                image: species.mainImage || '/images/logo-mini.webp',
                spectrogram: audio.spectrogramImage,
                images: allMediaImages
            }
        });
        window.dispatchEvent(event);
    };

    return (
        <tr className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
            <td className="p-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <MediaViewer
                        src={species.mainImage || '/images/logo-mini.webp'}
                        alt=""
                        className="w-full h-full object-cover"
                        isLoaded={isLoaded}
                        onLoaded={() => setIsLoaded(true)}
                    />
                </div>
            </td>
            <td className="p-3">
                <div className="flex flex-col">
                    <span className="text-sm font-serif italic text-gray-900 dark:text-white group-hover:text-accent-green transition-colors">{species.scientificName}</span>
                    <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">{species.class_name}</span>
                </div>
            </td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{commonName || '-'}</td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{species.family}</td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate max-w-[150px]">{species.location}</span>
                </div>
            </td>
            <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    {species.audios.length > 0 && (
                        <button onClick={onPlay} className="p-2 rounded-lg bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-white transition-all">
                            <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                    )}
                    <a href={detailLink} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-accent-green transition-all">
                        <Info className="w-3.5 h-3.5" />
                    </a>
                </div>
            </td>
        </tr>
    );
};

export const SpeciesCard: React.FC<SpeciesCardProps> = ({ species, viewMode = 'grid', lang, linkToFilter = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const coverImage = species.mainImage || '/images/logo-mini.webp';
    const detailLink = linkToFilter ? `/${lang}/species?q=${encodeURIComponent(species.scientificName)}` : `/${lang}/species/${species.id}`;

    const categoryTitles: Record<string, string> = {
        Amphibians: lang === 'es' ? 'Anfibios' : lang === 'pt' ? 'Anfíbios' : 'Amphibians',
        Birds: lang === 'es' ? 'Aves' : 'Birds',
        Crickets: lang === 'es' ? 'Grillos' : lang === 'pt' ? 'Grilos' : 'Crickets',
        Mammals: lang === 'es' ? 'Mamíferos' : lang === 'pt' ? 'Mamíferos' : 'Mammals',
        Reptiles: 'Reptiles'
    };

    const commonName = useMemo(() => {
        if (lang === 'en') return species.commonName_en;
        if (lang === 'pt') return species.commonName_pt;
        return species.commonName_es;
    }, [species, lang]);

    const onPlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🖱️ SpeciesCard: Play button clicked for", species.scientificName);
        if (species.audios.length === 0) {
            console.warn("⚠️ SpeciesCard: No audios available for this species.");
            return;
        }
        const audio = species.audios[0];
        const allMediaImages = [
            ...(species.galleryImages?.map(img => img.url) || []),
            ...(species.spectrograms?.map(img => img.url) || [])
        ].filter(Boolean);

        const event = new CustomEvent('play-audio', {
            detail: {
                title: audio.title || 'Canto',
                artist: `${commonName} (${species.scientificName})`,
                url: audio.url,
                image: species.mainImage || '/images/logo-mini.webp',
                spectrogram: audio.spectrogramImage,
                images: allMediaImages
            }
        });
        console.log("📡 SpeciesCard: Dispatching 'play-audio' event...");
        window.dispatchEvent(event);
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                className="bg-white dark:bg-[#121b28] p-3 rounded-none border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:border-accent-green/30 hover:shadow-none transition-all group flex-wrap md:flex-nowrap"
            >
                <div className="w-12 h-12 rounded-none overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-900 border border-gray-50 dark:border-gray-800 relative">
                    <MediaViewer
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        isLoaded={isLoaded}
                        onLoaded={() => setIsLoaded(true)}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">{categoryTitles[species.category] || species.category}</span>
                    <p className=" italic truncate">{species.scientificName}</p>
                </div>
                <div className="flex items-center gap-2 pr-2">
                    {species.audios.length > 0 && (
                        <button onClick={onPlay} className="p-2 rounded-none bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-white transition-all">
                            <Play className="w-4 h-4 fill-current" />
                        </button>
                    )}
                    <a href={detailLink} className="p-2 rounded-none bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-accent-green transition-all">
                        <Info className="w-4 h-4" />
                    </a>
                </div>
            </motion.div>
        );
    }

    return (
        <a
            href={detailLink}
            className="group block bg-[#fbfbf9] dark:bg-[#121b28] rounded-2xl transition-all duration-300 relative flex flex-col overflow-hidden shadow-none border-none"
        >
            <div className="aspect-[6/5] relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <MediaViewer
                    src={coverImage}
                    alt={species.scientificName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    isLoaded={isLoaded}
                    onLoaded={() => setIsLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    {species.audios.length > 0 && (
                        <button
                            onClick={onPlay}
                            className="bg-white/20 cursor-pointer backdrop-blur-md border border-white/30 text-white px-5 py-2 rounded-xl hover:bg-accent-green hover:border-accent-green transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 flex items-center gap-2 font-bold text-xs"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            {lang === 'es' ? 'Escuchar' : lang === 'pt' ? 'Ouvir' : 'Listen'}
                        </button>
                    )}
                </div>
            </div>

            <div className="py-5 flex-1 flex flex-col relative bg-[#fbfbf9] dark:bg-[#121b28]">
                <div className="mb-4">
                    <h4 className="text-[#0c141d] italic font-serif dark:text-white group-hover:text-accent-green transition-colors leading-tight mb-2 text-xl">
                        {species.scientificName}
                    </h4>
                    {species.location && species.location !== 'All' && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 line-clamp-2">
                            {species.location}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center gap-3 pt-4">
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-[#0c141d] group-hover:border-[#0c141d] transition-colors">
                        <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-[#0c141d] dark:text-white group-hover:text-accent-green transition-colors">
                        {lang === 'es' ? 'Leer más' : lang === 'pt' ? 'Leia mais' : 'Read more'}
                    </span>
                </div>
            </div>
        </a>
    );

};
