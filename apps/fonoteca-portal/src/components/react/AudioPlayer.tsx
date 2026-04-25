import React, { useEffect, useRef, useState, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import { X, Music, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface AudioPlayerProps {
    audioUrl: string;
    title?: string;
    artist?: string;
    description?: string;
    spectrogramImage?: string;
    spectrogramImages?: string[];
    autoplay?: boolean;
    onClose?: () => void;
    onFinish?: () => void;
    isModalContainer?: boolean;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
    layoutMode?: 'direct' | 'expandable';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    audioUrl, 
    title, 
    artist, 
    description,
    spectrogramImage,
    spectrogramImages = [],
    autoplay = false,
    onClose,
    onFinish,
    isModalContainer = false,
    onNext,
    onPrev,
    hasNext,
    hasPrev,
    layoutMode = 'direct'
}) => {
    const [isExpanded, setIsExpanded] = useState(layoutMode === 'direct');
    
    console.log("🔊 AudioPlayer: Rendering with audioUrl:", audioUrl, { isExpanded, layoutMode });
    const waveformRef = useRef<HTMLDivElement>(null);
    const spectrogramRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('0:00');
    const [currentTime, setCurrentTime] = useState('0:00');
    const [isReady, setIsReady] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [volume, setVolume] = useState(0.8);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const allImages = useMemo(() => {
        const imgs = [...spectrogramImages];
        if (spectrogramImage && !imgs.includes(spectrogramImage)) {
            imgs.unshift(spectrogramImage);
        }
        return imgs.filter(Boolean);
    }, [spectrogramImage, spectrogramImages]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secondsRemaining = Math.floor(seconds % 60);
        return `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;
    };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

    const handleClose = () => {
        if (onClose) onClose();
    };

    useEffect(() => {
        if (!waveformRef.current || !spectrogramRef.current || !timelineRef.current) return;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#4f4f4f',
            progressColor: '#45a45e',
            cursorColor: '#ffffff',
            height: 40,
            barWidth: 2,
            barGap: 3,
            normalize: true,
            plugins: [
                Spectrogram.create({
                    container: spectrogramRef.current,
                    labels: true,
                    height: 180,
                    splitChannels: false,
                }),
                Timeline.create({
                    container: timelineRef.current,
                }),
                Hover.create({
                    lineColor: '#ff0000',
                    lineWidth: 2,
                    labelBackground: '#555',
                    labelColor: '#fff',
                    labelSize: '11px',
                }),
            ],
        });

        wavesurferRef.current = ws;

        ws.load(audioUrl);

        ws.on('ready', () => {
            setIsReady(true);
            setDuration(formatTime(ws.getDuration()));
            if (autoplay) ws.play();
        });

        ws.on('audioprocess', () => {
            setCurrentTime(formatTime(ws.getCurrentTime()));
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        
        ws.on('finish', () => {
            setIsPlaying(false);
            if (onFinish) onFinish();
        });

        return () => ws.destroy();
    }, [audioUrl]);

    const togglePlay = () => wavesurferRef.current?.playPause();

    const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = Number(e.target.value);
        setZoom(newZoom);
        wavesurferRef.current?.zoom(newZoom * 50);
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = Number(e.target.value);
        setVolume(newVol);
        wavesurferRef.current?.setVolume(newVol);
    };

    // Style logic
    const isFullScreen = isExpanded || isModalContainer;
    
    const containerClasses = `bg-[#121212] flex flex-col rounded-xl overflow-hidden border border-gray-800 shadow-2xl font-sans transition-all duration-300 ${
        isFullScreen 
        ? 'fixed inset-0 z-[250] w-[95vw] h-[95vh] m-auto md:w-[90vw] md:h-[90vh]' 
        : 'w-full relative min-h-[500px]'
    }`;

    return (
        <>
            {isFullScreen && <div className="fixed inset-0 z-[240] bg-black/95 backdrop-blur-md" onClick={() => layoutMode === 'expandable' ? setIsExpanded(false) : handleClose()}></div>}
            
            <div className={containerClasses}>
                {/* Technical Header */}
                <div className="bg-[#1a1a1a] px-4 sm:px-6 py-3 border-b border-gray-800 flex justify-between items-center sm:min-h-[64px] flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {(onPrev || onNext) && (
                            <div className="flex items-center flex-shrink-0">
                                <button onClick={onPrev} disabled={!hasPrev} className={`p-1.5 rounded-full transition-colors ${!hasPrev ? 'text-gray-700 cursor-not-allowed opacity-50' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={onNext} disabled={!hasNext} className={`p-1.5 rounded-full transition-colors ${!hasNext ? 'text-gray-700 cursor-not-allowed opacity-50' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <div className="truncate">
                            <h4 className="text-gray-200 font-bold text-sm tracking-wide truncate">{title || 'Análisis Espectral'}</h4>
                            <p className="text-gray-500 text-xs truncate">{artist}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isFullScreen ? (
                            <button 
                                onClick={() => setIsExpanded(true)} 
                                className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all flex items-center gap-2"
                                title="Expandir a Pantalla Completa"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Modo Análisis</span>
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        ) : (
                            layoutMode === 'expandable' && (
                                <button 
                                    onClick={() => setIsExpanded(false)} 
                                    className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                                    title="Contraer"
                                >
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                            )
                        )}
                        
                        {onClose && (
                            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Viewport Area */}
                <div className="relative w-full bg-black group p-4 flex flex-col flex-1 overflow-hidden">
                    {/* Spectrogram Navigation */}
                    <div className="w-full h-48 md:h-64 bg-black/40 rounded-2xl overflow-hidden mb-6 relative group/img">
                        {allImages.length > 0 ? (
                            <>
                                <img src={allImages[currentImageIndex]} alt="Spectrogram" className="w-full h-full object-contain" />
                                {allImages.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"><ChevronLeft className="w-6 h-6" /></button>
                                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"><ChevronRight className="w-6 h-6" /></button>
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold tracking-widest uppercase">{currentImageIndex + 1} / {allImages.length}</div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                                <Music className="w-12 h-12 mb-2" />
                                <span className="text-xs font-medium uppercase tracking-widest">No Spectrogram</span>
                            </div>
                        )}
                    </div>

                    <div ref={timelineRef} className="w-full bg-[#181818] flex-shrink-0" />
                    <div ref={spectrogramRef} className="w-full relative overflow-hidden flex-1" style={{ minHeight: '150px' }} />
                    <div ref={waveformRef} className="w-full relative bg-[#111111] overflow-hidden border-t border-gray-900 flex-shrink-0" />
                </div>

                {/* Controls Area (Console Style) */}
                <div className="bg-[#181818] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                        <button
                            onClick={togglePlay}
                            disabled={!isReady}
                            className="w-12 h-12 flex-shrink-0 bg-accent-green text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-accent-green/10"
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 ml-1">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                        
                        <div className="font-mono text-sm tracking-wider flex items-center gap-2">
                            <span className="text-accent-green font-medium min-w-[50px]">{currentTime}</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-400 min-w-[50px]">{duration}</span>
                        </div>
                    </div>

                    {/* Tools Area (Zoom & Volume) */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 bg-[#121212] px-4 py-2 rounded-lg border border-gray-800/60">
                        {/* Zoom */}
                        <div className="flex items-center gap-2" title="Zoom Espectrograma">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-1">Zoom</span>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="0.5"
                                value={zoom}
                                onChange={handleZoom}
                                className="w-20 md:w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-green"
                            />
                        </div>

                        <div className="w-px h-6 bg-gray-800 hidden sm:block"></div>

                        {/* Volume */}
                        <div className="flex items-center gap-2" title="Volumen">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleVolume}
                                className="w-16 md:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-green"
                            />
                        </div>
                    </div>
                </div>

                {description && (
                    <div className="px-6 py-3 bg-[#111] border-t border-gray-900 text-[10px] text-gray-500 flex-shrink-0 flex items-center gap-2">
                        <span className="font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Nota:</span>
                        <span className="truncate">{description}</span>
                    </div>
                )}
            </div>
        </>
    );
};
