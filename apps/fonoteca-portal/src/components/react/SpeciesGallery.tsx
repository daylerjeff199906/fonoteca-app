import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
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
    const [zoomScale, setZoomScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const lightboxRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

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
                closeLightbox();
            }
            if (items.length <= 1) return;
            
            if (e.key === 'ArrowRight') {
                if (lightboxIndex !== null) {
                    handleNextLightbox();
                } else {
                    nextImage();
                }
            }
            if (e.key === 'ArrowLeft') {
                if (lightboxIndex !== null) {
                    handlePrevLightbox();
                } else {
                    prevImage();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, lightboxIndex, items]);

    // Sync fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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

    const handleNextLightbox = () => {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
        setZoomScale(1);
    };

    const handlePrevLightbox = () => {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
        setZoomScale(1);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
        setZoomScale(1);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomScale(prev => Math.max(prev - 0.25, 1));
    };

    const handleToggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lightboxRef.current) return;

        if (!document.fullscreenElement) {
            lightboxRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const xDragLimit = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth * (zoomScale - 1)) / 2) : 0;
    const yDragLimit = typeof window !== 'undefined' ? Math.max(0, (window.innerHeight * (zoomScale - 1)) / 2) : 0;

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
                                onClick={() => {
                                    setActiveIndex(idx);
                                    setZoomScale(1);
                                }}
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

            {/* Facebook-style Lightbox Overlay (Solid Black, Faithful to attached image) */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        ref={lightboxRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[350] bg-black flex flex-col justify-between select-none"
                        onClick={closeLightbox}
                    >
                        {/* Top Control Bar */}
                        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                            {/* Top Left: Close Button */}
                            <div className="flex items-center gap-3 pointer-events-auto">
                                <button
                                    className="w-9 h-9 rounded-full bg-[#1c1d1e] hover:bg-[#2d2e2f] text-white flex items-center justify-center transition-all cursor-pointer"
                                    onClick={closeLightbox}
                                    title={lang === 'es' ? 'Cerrar' : 'Close'}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Top Right: Actions group (Zoom In, Zoom Out, Fullscreen) */}
                            <div className="flex items-center gap-2 pointer-events-auto">
                                <button
                                    onClick={handleZoomIn}
                                    className="w-9 h-9 rounded-full bg-[#1c1d1e] hover:bg-[#2d2e2f] text-white flex items-center justify-center transition-all cursor-pointer"
                                    title={lang === 'es' ? 'Acercar' : 'Zoom In'}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleZoomOut}
                                    className="w-9 h-9 rounded-full bg-[#1c1d1e] hover:bg-[#2d2e2f] text-white flex items-center justify-center transition-all cursor-pointer"
                                    title={lang === 'es' ? 'Alejar' : 'Zoom Out'}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleToggleFullscreen}
                                    className="w-9 h-9 rounded-full bg-[#1c1d1e] hover:bg-[#2d2e2f] text-white flex items-center justify-center transition-all cursor-pointer"
                                    title={isFullscreen ? (lang === 'es' ? 'Salir de pantalla completa' : 'Exit fullscreen') : (lang === 'es' ? 'Pantalla completa' : 'Fullscreen')}
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Middle Viewport (Contains navigation chevrons and active image) */}
                        <div ref={viewportRef} className="relative flex-grow w-full h-full flex items-center justify-center overflow-hidden">
                            
                            {/* Left Navigation Chevron */}
                            {items.length > 1 && (
                                <button
                                    className="absolute left-6 z-45 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-white/5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrevLightbox();
                                    }}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                            )}

                            {/* Center Active Image - Mathematically precise boundaries prevent image from flying off the viewport */}
                            <motion.img
                                drag={zoomScale > 1}
                                dragConstraints={{
                                    left: -xDragLimit,
                                    right: xDragLimit,
                                    top: -yDragLimit,
                                    bottom: yDragLimit
                                }}
                                dragElastic={0.15}
                                animate={{
                                    x: zoomScale === 1 ? 0 : undefined,
                                    y: zoomScale === 1 ? 0 : undefined,
                                    scale: zoomScale
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                src={items[lightboxIndex].url}
                                className={`h-full w-auto max-w-none object-contain pointer-events-auto ${
                                    zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
                                }`}
                                alt={`Facebook view ${lightboxIndex + 1}`}
                                onClick={(e) => e.stopPropagation()}
                            />

                            {/* Right Navigation Chevron */}
                            {items.length > 1 && (
                                <button
                                    className="absolute right-6 z-45 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer border border-white/5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNextLightbox();
                                    }}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            )}
                        </div>

                        {/* Bottom Information Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex flex-col items-center gap-2">
                            {/* Centered Counter */}
                            <div className="text-white/40 text-[10px] font-medium tracking-widest uppercase">
                                {lightboxIndex + 1} / {items.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
