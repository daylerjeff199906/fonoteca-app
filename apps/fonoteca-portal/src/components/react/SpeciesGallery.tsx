import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeciesGalleryProps {
    images: string[];
    contain?: boolean;
}

export const SpeciesGallery: React.FC<SpeciesGalleryProps> = ({ images, contain = false }) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Filter out invalid images if needed, but we trust the data layer for now
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <img src="/images/logo-mini.webp" className="w-16 mx-auto opacity-20 mb-2" alt="No images" />
                    <p className="text-gray-400 text-sm">No hay imágenes disponibles</p>
                </div>
            </div>
        );
    }

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
    };
    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
    };

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    const renderGrid = () => {
        const count = images.length;
        const imgClass = `w-full h-full ${contain ? 'object-contain p-4' : 'object-cover'} group-hover:scale-110 transition-transform duration-1000`;
        const cellClass = "cursor-pointer overflow-hidden group bg-[#111] relative flex items-center justify-center";

        if (count === 1) {
            return (
                <div className={`${cellClass} w-full aspect-video rounded-3xl shadow-xl overflow-hidden`} onClick={() => openLightbox(0)}>
                    <img src={images[0]} className={imgClass} alt="Gallery 1" />
                </div>
            );
        }

        if (count === 2) {
            return (
                <div className="grid grid-cols-2 gap-3 h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl">
                    {images.slice(0, 2).map((img, i) => (
                        <div key={i} className={`${cellClass} h-full`} onClick={() => openLightbox(i)}>
                            <img src={img} className={imgClass} alt={`Gallery ${i + 1}`} />
                        </div>
                    ))}
                </div>
            );
        }

        if (count === 3) {
            return (
                <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">
                    <div className={`${cellClass} row-span-2 h-full`} onClick={() => openLightbox(0)}>
                        <img src={images[0]} className={imgClass} alt="Gallery 1" />
                    </div>
                    {images.slice(1, 3).map((img, i) => (
                        <div key={i + 1} className={`${cellClass} h-full`} onClick={() => openLightbox(i + 1)}>
                            <img src={img} className={imgClass} alt={`Gallery ${i + 2}`} />
                        </div>
                    ))}
                </div>
            );
        }

        if (count === 4) {
            return (
                <div className="grid grid-cols-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                    <div className={`${cellClass} h-full`} onClick={() => openLightbox(0)}>
                        <img src={images[0]} className={imgClass} alt="Gallery 1" />
                    </div>
                    <div className="grid grid-rows-3 gap-3 h-full">
                        {images.slice(1, 4).map((img, i) => (
                            <div key={i + 1} className={`${cellClass} h-full`} onClick={() => openLightbox(i + 1)}>
                                <img src={img} className={imgClass} alt={`Gallery ${i + 2}`} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 5 or more (Facebook Style: 2 top, 3 bottom)
        return (
            <div className="flex flex-col gap-3 h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-[#080808]">
                {/* Top Row: 2 images */}
                <div className="grid grid-cols-2 gap-3 h-[60%]">
                    {images.slice(0, 2).map((img, i) => (
                        <div key={i} className={`${cellClass} h-full`} onClick={() => openLightbox(i)}>
                            <img src={img} className={imgClass} alt={`Gallery ${i + 1}`} />
                        </div>
                    ))}
                </div>

                {/* Bottom Row: 3 images */}
                <div className="grid grid-cols-3 gap-3 h-[40%]">
                    {images.slice(2, 4).map((img, i) => (
                        <div key={i + 2} className={`${cellClass} h-full`} onClick={() => openLightbox(i + 2)}>
                            <img src={img} className={imgClass} alt={`Gallery ${i + 3}`} />
                        </div>
                    ))}
                    {/* The 5th item with the +X overlay */}
                    <div className={`${cellClass} h-full`} onClick={() => openLightbox(4)}>
                        <img src={images[4]} className={imgClass} alt="Gallery 5" />
                        {images.length > 5 && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 pointer-events-none">
                                <div className="text-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                    <span className="text-white text-5xl block leading-none">+{images.length - 5}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            {renderGrid()}

            {/* Lightbox / Facebook Style Viewer */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-10 backdrop-blur-md"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 backdrop-blur-md"
                            onClick={closeLightbox}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md"
                                    onClick={prevImage}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md"
                                    onClick={nextImage}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-[10px] font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md uppercase tracking-[0.2em] pointer-events-none">
                            {lightboxIndex + 1} / {images.length}
                        </div>

                        {/* Image Container with fixed height vs responsive width logic */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
                        >
                            <div className="relative bg-[#050505] p-2 md:p-3 rounded-2xl border border-white/10 flex items-center justify-center max-w-[95vw] max-h-[85vh] overflow-hidden pointer-events-auto">
                                <img
                                    src={images[lightboxIndex]}
                                    className="max-w-full max-h-[70vh] md:max-h-[75vh] w-auto h-auto object-contain transition-all rounded-lg"
                                    alt={`Gallery ${lightboxIndex + 1}`}
                                />
                            </div>

                            {/* Metadata/Caption Placeholder Area */}
                            <div className="mt-6 text-white/20 text-[9px] tracking-[0.4em] uppercase pointer-events-none font-medium">
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
