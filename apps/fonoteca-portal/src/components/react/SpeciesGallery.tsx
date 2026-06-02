import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Multimedia } from '../../data/species';

interface SpeciesGalleryProps {
    images?: string[];
    mediaItems?: Multimedia[];
    contain?: boolean;
    lang?: string;
}

const getTagLabel = (tag: string | null, lang: string = 'es') => {
    if (!tag) return '';
    const clean = tag.trim().toLowerCase();
    if (clean === 'spectrogram') {
        return lang === 'es' ? 'Espectrograma' : lang === 'pt' ? 'Espectrograma' : 'Spectrogram';
    }
    if (clean === 'photo' || clean === 'still' || clean === 'main' || clean === 'gallery') {
        return lang === 'es' ? 'Fotografía' : lang === 'pt' ? 'Fotografia' : 'Photo';
    }
    return tag.charAt(0).toUpperCase() + tag.slice(1);
};

export const SpeciesGallery: React.FC<SpeciesGalleryProps> = ({
    images = [],
    mediaItems = [],
    contain = true,
    lang = 'es'
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Resolve props into unified list of items with url and tag
    const items = React.useMemo(() => {
        if (mediaItems && mediaItems.length > 0) {
            return mediaItems.map(item => ({
                url: item.url,
                tag: item.tag,
                title: item.title,
                description: item.description
            }));
        }
        if (images && images.length > 0) {
            return images.map(url => ({
                url: url,
                tag: null,
                title: null,
                description: null
            }));
        }
        return [];
    }, [mediaItems, images]);

    // Handle keys for navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxIndex(null);
            }
            if (items.length <= 1) return;
            
            if (e.key === 'ArrowRight') {
                if (lightboxIndex !== null) {
                    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
                } else {
                    nextImage();
                }
            }
            if (e.key === 'ArrowLeft') {
                if (lightboxIndex !== null) {
                    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
                } else {
                    prevImage();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, lightboxIndex, items]);

    if (items.length === 0) {
        return (
            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <img src="/images/logo-mini.webp" className="w-16 mx-auto opacity-20 mb-2" alt="No images" />
                    <p className="text-gray-400 text-sm">
                        {lang === 'es' ? 'No hay imágenes disponibles' : lang === 'pt' ? 'Nenhuma imagem disponível' : 'No images available'}
                    </p>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const currentItem = items[activeIndex];

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Main Image Viewport (Gray background, centered image, faithfully matched to design, shadowless) */}
            <div className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] bg-[#f3f4f6] dark:bg-[#111827] rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
                
                {/* Image tag overlay */}
                {currentItem.tag && (
                    <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-white/10 z-10 select-none">
                        {getTagLabel(currentItem.tag, lang)}
                    </span>
                )}

                {/* Main Rendered Image (Clickable for Facebook Lightbox) */}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        src={currentItem.url}
                        alt={currentItem.title || `Species image ${activeIndex + 1}`}
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none p-4 cursor-pointer"
                        onClick={() => setLightboxIndex(activeIndex)}
                    />
                </AnimatePresence>

                {/* Left Chevron (Hidden if 1 item) */}
                {items.length > 1 && (
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 backdrop-blur-sm"
                        title={lang === 'es' ? 'Anterior' : 'Previous'}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Right Chevron (Hidden if 1 item) */}
                {items.length > 1 && (
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 backdrop-blur-sm"
                        title={lang === 'es' ? 'Siguiente' : 'Next'}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Info Button (Bottom Left) */}
                <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2">
                    <button
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm ${
                            isInfoOpen
                                ? 'bg-accent-green text-white'
                                : 'bg-black/20 hover:bg-black/40 text-white/90 hover:text-white'
                        }`}
                        title={lang === 'es' ? 'Mostrar información' : 'Show information'}
                    >
                        <Info className="w-5 h-5" />
                    </button>

                    {/* Popover Description Info */}
                    <AnimatePresence>
                        {isInfoOpen && (currentItem.title || currentItem.description || currentItem.tag) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-black/90 text-white text-xs p-3 rounded-lg border border-white/10 max-w-xs backdrop-blur-md"
                            >
                                <p className="font-semibold text-[10px] uppercase text-accent-green mb-1">
                                    {currentItem.tag ? getTagLabel(currentItem.tag, lang) : 'Multimedia'}
                                </p>
                                {currentItem.title && <p className="font-semibold mb-1">{currentItem.title}</p>}
                                {currentItem.description && <p className="text-gray-300 font-light">{currentItem.description}</p>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Counter Badge (Bottom Right) */}
                <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded border border-white/10 select-none tracking-wider">
                    {activeIndex + 1} / {items.length}
                </div>
            </div>

            {/* Thumbnail Row (Hidden if only 1 item) */}
            {items.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
                    {items.map((item, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-16 h-16 rounded-md overflow-hidden bg-black border-2 transition-all flex-shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'border-blue-500 scale-105'
                                        : 'border-transparent hover:border-gray-400 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={item.url}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Facebook-style Lightbox Overlay */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center p-4 md:p-10 backdrop-blur-md"
                        onClick={() => setLightboxIndex(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 backdrop-blur-md cursor-pointer"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Chevrons inside Lightbox */}
                        {items.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
                                    }}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
                                    }}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-[10px] font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md uppercase tracking-[0.2em] pointer-events-none">
                            {lightboxIndex + 1} / {items.length}
                        </div>

                        {/* Image Display */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
                        >
                            <div className="relative bg-[#050505] p-2 md:p-3 rounded-2xl border border-white/10 flex items-center justify-center max-w-[95vw] max-h-[85vh] overflow-hidden pointer-events-auto">
                                <img
                                    src={items[lightboxIndex].url}
                                    className="max-w-full max-h-[70vh] md:max-h-[75vh] w-auto h-auto object-contain transition-all rounded-lg"
                                    alt={`Lightbox species ${lightboxIndex + 1}`}
                                />
                            </div>

                            {/* Tag badge in Lightbox */}
                            {items[lightboxIndex].tag && (
                                <div className="mt-4 text-accent-green text-[10px] font-semibold uppercase tracking-[0.2em] bg-accent-green/10 border border-accent-green/20 px-3 py-1 rounded backdrop-blur-md select-none pointer-events-auto">
                                    {getTagLabel(items[lightboxIndex].tag, lang)}
                                </div>
                            )}

                            {/* Info text inside Lightbox */}
                            {items[lightboxIndex].title && (
                                <div className="mt-2 text-white/90 text-xs text-center font-normal max-w-md pointer-events-auto px-4">
                                    {items[lightboxIndex].title}
                                </div>
                            )}

                            <div className="mt-1 text-white/20 text-[9px] tracking-[0.4em] uppercase pointer-events-none font-medium">
                                Visualización de Registro
                            </div>
                        </motion.div>

                        {/* ESC key hint */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-[8px] tracking-[0.5em] uppercase">
                            Presiona ESC para cerrar
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
