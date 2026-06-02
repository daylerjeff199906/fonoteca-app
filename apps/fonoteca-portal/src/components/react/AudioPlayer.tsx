import React, { useEffect, useRef, useState, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { X, Music, ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

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
    species?: any;
    lang?: string;
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
    layoutMode = 'direct',
    species,
    lang = 'es'
}) => {
    const [isExpanded, setIsExpanded] = useState(layoutMode === 'direct');

    console.log("🔊 AudioPlayer: Rendering with audioUrl:", audioUrl, { isExpanded, layoutMode });
    const waveformRef = useRef<HTMLDivElement>(null);
    const spectrogramRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const wsRegionsRef = useRef<any>(null);
    const wsSpectrogramRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('0:00');
    const [currentTime, setCurrentTime] = useState('0:00');
    const [isReady, setIsReady] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [volume, setVolume] = useState(0.8);

    // New states for biological acoustic analysis & collapsible panel
    const [sampleRate, setSampleRate] = useState(44100);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
    const [frequencyUnit, setFrequencyUnit] = useState<'kHz' | 'Hz'>('kHz');
    const [colorMapType, setColorMapType] = useState<'color' | 'grayscale'>('color');
    const [showBottomDetails, setShowBottomDetails] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'multimedia'>('info');

    // Associated spectrograms / visual files of the audio
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

    const handleClose = () => {
        if (onClose) onClose();
    };

    // Helper to recursively find canvas within Shadow DOM / standard DOM
    const getCanvasFromRef = (ref: HTMLDivElement | null): HTMLCanvasElement | null => {
        if (!ref) return null;
        let canvas = ref.querySelector('canvas');
        if (canvas) return canvas;

        if (ref.shadowRoot) {
            canvas = ref.shadowRoot.querySelector('canvas');
            if (canvas) return canvas;
        }

        const deepSearch = (element: Element): HTMLCanvasElement | null => {
            if (element.tagName === 'CANVAS') {
                return element as HTMLCanvasElement;
            }
            if (element.shadowRoot) {
                const found = deepSearch(element.shadowRoot as unknown as Element);
                if (found) return found;
            }
            for (let i = 0; i < element.children.length; i++) {
                const found = deepSearch(element.children[i]);
                if (found) return found;
            }
            return null;
        };

        for (let i = 0; i < ref.children.length; i++) {
            const found = deepSearch(ref.children[i]);
            if (found) return found;
        }
        return null;
    };

    useEffect(() => {
        if (!waveformRef.current || !spectrogramRef.current || !timelineRef.current) return;

        // Measure container height dynamically on mount
        const containerHeight = spectrogramRef.current?.clientHeight || 280;

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

        // Create manually registered spectrogram to allow dynamic resizing of height
        const wsSpectrogram = ws.registerPlugin(Spectrogram.create({
            container: spectrogramRef.current,
            labels: false, // We render our own premium ticks
            height: containerHeight,
            splitChannels: false,
            scale: 'linear',
            colorMap: colorMapType === 'color' ? 'roseus' : 'gray',
        }));
        wsSpectrogramRef.current = wsSpectrogram;

        // Resize observer to scale spectrogram canvas dynamically without reloading audio
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                if (rect.height > 0 && wsSpectrogramRef.current) {
                    const newHeight = rect.height;
                    if (Math.abs(wsSpectrogramRef.current.height - newHeight) > 1) {
                        wsSpectrogramRef.current.height = newHeight;
                        wsSpectrogramRef.current.render();
                    }
                }
            }
        });

        if (spectrogramRef.current) {
            resizeObserver.observe(spectrogramRef.current);
        }

        // Initialize Regions plugin for Range Selection
        const wsRegions = ws.registerPlugin(Regions.create());
        wsRegionsRef.current = wsRegions;

        wsRegions.enableDragSelection({
            color: 'rgba(69, 164, 94, 0.08)',
        });

        wsRegions.on('region-created', (region) => {
            const active = wsRegions.getRegions();
            active.forEach((r) => {
                if (r !== region) r.remove();
            });
            setSelectedRange({ start: region.start, end: region.end });
        });

        wsRegions.on('region-updated', (region) => {
            setSelectedRange({ start: region.start, end: region.end });
        });

        wsRegions.on('region-removed', () => {
            setSelectedRange(null);
        });

        wavesurferRef.current = ws;

        ws.load(audioUrl);

        ws.on('ready', () => {
            setIsReady(true);
            setDuration(formatTime(ws.getDuration()));
            setDurationSeconds(ws.getDuration());
            setSampleRate(ws.getDecodedData()?.sampleRate || 44100);
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

        return () => {
            resizeObserver.disconnect();
            ws.destroy();
        };
    }, [audioUrl, colorMapType]);



    const togglePlay = () => wavesurferRef.current?.playPause();

    const handleRewind = () => {
        wavesurferRef.current?.setTime(0);
    };

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

    const playSelection = () => {
        if (!wavesurferRef.current || !selectedRange) return;

        // Seek to the start of the selection and play
        wavesurferRef.current.setTime(selectedRange.start);
        wavesurferRef.current.play();

        // Monitor playback to pause at the end
        const handleTimeUpdate = () => {
            const current = wavesurferRef.current?.getCurrentTime() || 0;
            if (current >= selectedRange.end) {
                wavesurferRef.current?.pause();
                wavesurferRef.current?.un('audioprocess', handleTimeUpdate);
            }
        };

        // Remove previous listener if any, then add new one
        wavesurferRef.current.on('audioprocess', handleTimeUpdate);

        // Also clean up listener when paused manually
        wavesurferRef.current.once('pause', () => {
            wavesurferRef.current?.un('audioprocess', handleTimeUpdate);
        });
    };

    const clearSelection = () => {
        wsRegionsRef.current?.clearRegions();
        setSelectedRange(null);
    };

    // Advanced canvas capture for scientific publishing
    const downloadCapture = async () => {
        try {
            const specCanvas = getCanvasFromRef(spectrogramRef.current);
            const waveCanvas = getCanvasFromRef(waveformRef.current);
            const timeCanvas = getCanvasFromRef(timelineRef.current);
            
            if (!specCanvas || !waveCanvas) {
                console.error("Canvas elements not found");
                return;
            }

            const specRect = specCanvas.getBoundingClientRect();
            const waveRect = waveCanvas.getBoundingClientRect();
            const timeRect = timeCanvas ? timeCanvas.getBoundingClientRect() : { height: 0 };

            const specDisplayWidth = specRect.width || specCanvas.width;
            const specDisplayHeight = specRect.height || specCanvas.height;
            const waveDisplayHeight = waveRect.height || waveCanvas.height;
            const timeDisplayHeight = timeRect.height || 0;

            // Setup dimensions
            const marginX = 80; // Left margin for frequency ticks (64px + padding)
            const legendWidth = 80; // Right margin for amplitude legend (64px + padding)
            const headerHeight = 90; // Space for professional header at the top
            const footerHeight = 45; // Space for logo/footer at the bottom
            const spacing = 15; // Vertical spacing between components
            
            // Base width matches the spectrogram's canvas width
            const width = specDisplayWidth + marginX + legendWidth;
            const height = headerHeight + specDisplayHeight + waveDisplayHeight + timeDisplayHeight + (spacing * 3) + footerHeight;

            // Create composite canvas
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = width;
            compositeCanvas.height = height;
            const ctx = compositeCanvas.getContext('2d');
            if (!ctx) return;

            // Fill beautiful dark background
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            // --- DRAW HEADER ---
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Inter, system-ui, sans-serif';
            // Scientific name
            const scientificName = species?.scientificName || 'Análisis Espectral';
            ctx.fillText(scientificName, 20, 35);

            // Vocalization / Title metadata
            ctx.fillStyle = '#a3a3a3';
            ctx.font = '12px Inter, system-ui, sans-serif';
            const metaText = `${title || 'Análisis'} | ${artist || 'Fonoteca'}`;
            ctx.fillText(metaText, 20, 55);

            // Curatorial details (Author / Locality / Date)
            const dateText = species?.databaseDetails?.occurrence_date ? ` | ${species.databaseDetails.occurrence_date}` : '';
            const authorText = species?.databaseDetails?.identifiedBy ? `Por: ${species.databaseDetails.identifiedBy}` : 'Autor: Desconocido';
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px monospace';
            ctx.fillText(`${authorText}${dateText}`, 20, 72);

            // Line separator below header
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(10, headerHeight - 5);
            ctx.lineTo(width - 10, headerHeight - 5);
            ctx.stroke();

            // --- DRAW SPECTROGRAM ---
            const specY = headerHeight + spacing;
            ctx.drawImage(specCanvas, marginX, specY, specDisplayWidth, specDisplayHeight);

            // --- DRAW FREQUENCY Y-AXIS (LEFT) ---
            ctx.fillStyle = '#9ca3af';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            
            const tickCount = 6;
            const maxFreq = sampleRate / 2;
            
            for (let i = 0; i < tickCount; i++) {
                const ratio = i / (tickCount - 1);
                const freq = maxFreq - ratio * maxFreq; // Max at the top, 0 at the bottom
                const y = specY + ratio * specDisplayHeight;
                
                const textVal = frequencyUnit === 'kHz' ? (freq / 1000).toFixed(1) : Math.round(freq).toString();
                ctx.fillText(textVal, marginX - 10, y);
                
                // Draw small tick mark
                ctx.strokeStyle = '#374151';
                ctx.beginPath();
                ctx.moveTo(marginX - 5, y);
                ctx.lineTo(marginX, y);
                ctx.stroke();
            }

            // Vertical label for Frequency Y-axis
            ctx.save();
            ctx.translate(25, specY + specDisplayHeight / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#4b5563';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            const freqAxisLabel = frequencyUnit === 'kHz' 
                ? (lang === 'es' ? 'FRECUENCIA (kHz)' : 'FREQUENCY (kHz)') 
                : (lang === 'es' ? 'FRECUENCIA (Hz)' : 'FREQUENCY (Hz)');
            ctx.fillText(freqAxisLabel, 0, 0);
            ctx.restore();

            // --- DRAW AMPLITUDE LEGEND (RIGHT) ---
            const legendX = marginX + specDisplayWidth + 15;
            // Draw vertical gradient bar
            const gradient = ctx.createLinearGradient(legendX, specY, legendX, specY + specDisplayHeight);
            if (colorMapType === 'color') {
                gradient.addColorStop(0, '#ef4444');
                gradient.addColorStop(0.16, '#f97316');
                gradient.addColorStop(0.33, '#eab308');
                gradient.addColorStop(0.5, '#22c55e');
                gradient.addColorStop(0.66, '#3b82f6');
                gradient.addColorStop(0.83, '#6366f1');
                gradient.addColorStop(1, '#dbeafe');
            } else {
                gradient.addColorStop(0, '#000000');
                gradient.addColorStop(1, '#ffffff');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(legendX, specY, 12, specDisplayHeight);

            // Draw ticks: 0 down to -30 dB
            ctx.fillStyle = '#9ca3af';
            ctx.font = '8px monospace';
            ctx.textAlign = 'left';
            
            const dbTicks = ['0', '-5', '-10', '-15', '-20', '-25', '-30'];
            for (let i = 0; i < dbTicks.length; i++) {
                const ratio = i / (dbTicks.length - 1);
                const y = specY + ratio * specDisplayHeight;
                ctx.fillText(`${dbTicks[i]} dB`, legendX + 18, y);
                
                // Draw tick mark
                ctx.strokeStyle = '#374151';
                ctx.beginPath();
                ctx.moveTo(legendX + 12, y);
                ctx.lineTo(legendX + 16, y);
                ctx.stroke();
            }

            // Vertical label for Amplitude axis
            ctx.save();
            ctx.translate(legendX + 55, specY + specDisplayHeight / 2);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#4b5563';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('AMPLITUD (dB)', 0, 0);
            ctx.restore();

            // --- DRAW WAVEFORM ---
            const waveY = specY + specDisplayHeight + spacing;
            ctx.drawImage(waveCanvas, marginX, waveY, specDisplayWidth, waveDisplayHeight);

            // --- DRAW TIMELINE (IF AVAILABLE) ---
            const timeY = waveY + waveDisplayHeight + spacing;
            if (timeCanvas) {
                ctx.drawImage(timeCanvas, marginX, timeY, specDisplayWidth, timeDisplayHeight);
            }

            // --- DRAW RANGE HIGHLIGHT OVERLAY (IF ACTIVE) ---
            if (selectedRange && durationSeconds > 0) {
                const activeWidth = specDisplayWidth;
                const startRatio = selectedRange.start / durationSeconds;
                const endRatio = selectedRange.end / durationSeconds;
                const selectX = marginX + startRatio * activeWidth;
                const selectWidth = (endRatio - startRatio) * activeWidth;
                
                // Draw filled green rectangle with transparency
                ctx.fillStyle = 'rgba(69, 164, 94, 0.12)';
                ctx.fillRect(selectX, specY, selectWidth, specDisplayHeight + waveDisplayHeight + spacing + (timeCanvas ? timeDisplayHeight + spacing : 0));
                
                // Draw solid vertical borders for range limits
                ctx.strokeStyle = 'rgba(69, 164, 94, 0.7)';
                ctx.lineWidth = 1.5;
                
                // Left border
                ctx.beginPath();
                ctx.moveTo(selectX, specY);
                ctx.lineTo(selectX, timeY + (timeCanvas ? timeDisplayHeight : 0));
                ctx.stroke();
                
                // Right border
                ctx.beginPath();
                ctx.moveTo(selectX + selectWidth, specY);
                ctx.lineTo(selectX + selectWidth, timeY + (timeCanvas ? timeDisplayHeight : 0));
                ctx.stroke();

                // Label text over selected range
                ctx.fillStyle = '#45a45e';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                const rangeLabel = `Rango: ${selectedRange.start.toFixed(2)}s - ${selectedRange.end.toFixed(2)}s (${(selectedRange.end - selectedRange.start).toFixed(2)}s)`;
                ctx.fillText(rangeLabel, selectX + selectWidth / 2, specY - 5);
            }

            // --- DRAW FOOTER ---
            const footerY = height - 18;
            ctx.fillStyle = '#4b5563';
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('FONOTECA - BIBLIOTECA ACÚSTICA CIENTÍFICA', 20, footerY);

            ctx.textAlign = 'right';
            ctx.fillText(new Date().toLocaleString(), width - 20, footerY);

            // Trigger file download
            const url = compositeCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            const filename = `espectrograma_${scientificName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.png`;
            link.href = url;
            link.download = filename;
            link.click();
        } catch (err) {
            console.error("Error creating audio player screenshot:", err);
        }
    };

    // Calculate left Axis Ticks dynamically
    const ticks = useMemo(() => {
        const tickList = [];
        const tickCount = 6;
        const maxFreq = sampleRate / 2;
        for (let i = tickCount - 1; i >= 0; i--) {
            const freq = (i / (tickCount - 1)) * maxFreq;
            tickList.push(freq);
        }
        return tickList;
    }, [sampleRate]);

    // Style logic
    const isFullScreen = isExpanded || isModalContainer;

    const containerClasses = `bg-[#121212] flex rounded-xl overflow-hidden border border-gray-800 shadow-2xl font-sans transition-all duration-300 ${isFullScreen
        ? 'fixed inset-0 z-[250] w-[95vw] h-[95vh] m-auto md:w-[98vw] md:h-[98vh] flex-col'
        : 'w-full relative min-h-[500px] flex-col'
        }`;

    return (
        <>
            {isFullScreen && <div className="fixed inset-0 z-[240] bg-black/95 backdrop-blur-md" onClick={() => layoutMode === 'expandable' ? setIsExpanded(false) : handleClose()}></div>}

            <div className={containerClasses}>
                {/* MAIN - Audio Player & Ficha */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
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

                    {/* Viewport Area (expands dynamically to fill vertical space) */}
                    <div className="relative w-full bg-black group p-4 flex flex-col flex-grow flex-shrink min-h-[220px] overflow-hidden flex-1">
                        {/* Timeline aligned row */}
                        <div className="flex flex-row w-full bg-[#181818] flex-shrink-0">
                            <div className="w-16 flex-shrink-0" /> {/* Left spacer matching Y-axis */}
                            <div ref={timelineRef} className="flex-grow" />
                            <div className="w-16 flex-shrink-0" /> {/* Right spacer matching Legend */}
                        </div>

                        {/* Dynamic Spectrogram Row with left axis and right legend */}
                        <div className="flex flex-row relative flex-1 min-h-[220px] bg-black">
                            {/* LEFT: Custom vertical Y-Axis ticks */}
                            <div className="w-16 flex-shrink-0 flex flex-col justify-between py-0.5 border-r border-gray-900 font-mono text-[9px] text-gray-500 pr-2 select-none relative z-10 bg-black">
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 origin-left whitespace-nowrap text-[8px] tracking-widest uppercase font-black text-gray-600">
                                    {frequencyUnit === 'kHz' ? (lang === 'es' ? 'Frecuencia (kHz)' : 'Frequency (kHz)') : (lang === 'es' ? 'Frecuencia (Hz)' : 'Frequency (Hz)')}
                                </div>
                                {ticks.map((freq, idx) => (
                                    <div key={idx} className="flex justify-end items-center gap-1.5 h-0">
                                        <span className="font-bold text-gray-400">{frequencyUnit === 'kHz' ? (freq / 1000).toFixed(1) : Math.round(freq)}</span>
                                        <div className="w-1.5 h-px bg-gray-800"></div>
                                    </div>
                                ))}
                            </div>

                            {/* CENTER: Spectrogram Canvas */}
                            <div ref={spectrogramRef} className="flex-grow h-full relative overflow-hidden bg-black [&>div]:h-full [&>div>div]:h-full [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full" />

                            {/* RIGHT: Beautiful Amplitude Gradient scale legend */}
                            <div className="w-16 flex-shrink-0 flex flex-row items-stretch py-0.5 border-l border-gray-900 pl-2 font-mono text-[9px] text-gray-500 select-none relative z-10 bg-black">
                                <div
                                    className="w-2.5 rounded-sm flex-shrink-0"
                                    style={{
                                        background: colorMapType === 'color'
                                            ? 'linear-gradient(to bottom, #ef4444 0%, #f97316 16%, #eab308 33%, #22c55e 50%, #3b82f6 66%, #6366f1 83%, #dbeafe 100%)'
                                            : 'linear-gradient(to bottom, #000000 0%, #ffffff 100%)'
                                    }}
                                />
                                <div className="flex-1 flex flex-col justify-between pl-1.5 py-0">
                                    {['0', '-5', '-10', '-15', '-20', '-25', '-30'].map((db, idx) => (
                                        <div key={idx} className="flex items-center gap-1 h-0">
                                            <div className="w-1 h-px bg-gray-800"></div>
                                            <span className="text-[8px] font-bold text-gray-400">{db} dB</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 rotate-90 origin-right whitespace-nowrap text-[8px] tracking-widest uppercase font-black text-gray-600">
                                    Amplitud (dB)
                                </div>
                            </div>
                        </div>

                        {/* Waveform aligned row */}
                        <div className="flex flex-row w-full bg-[#111111] overflow-hidden border-t border-gray-900 flex-shrink-0">
                            <div className="w-16 flex-shrink-0" /> {/* Left spacer matching Y-axis */}
                            <div ref={waveformRef} className="flex-grow" />
                            <div className="w-16 flex-shrink-0" /> {/* Right spacer matching Legend */}
                        </div>

                        {/* Range Selection Overlay */}
                        {selectedRange && durationSeconds > 0 && (
                            <div
                                className="absolute top-4 bottom-4 border-l border-r border-accent-green bg-accent-green/12 pointer-events-none transition-all z-20 flex justify-between"
                                style={{
                                    left: `calc(16px + 64px + (${selectedRange.start} / ${durationSeconds}) * (100% - 32px - 128px))`,
                                    width: `calc((${selectedRange.end - selectedRange.start} / ${durationSeconds}) * (100% - 32px - 128px))`
                                }}
                            >
                                <div className="w-1 h-full bg-accent-green/60 shadow-lg flex items-center justify-center">
                                    <div className="w-[1.5px] h-6 bg-white/80 rounded"></div>
                                </div>
                                <div className="w-1 h-full bg-accent-green/60 shadow-lg flex items-center justify-center">
                                    <div className="w-[1.5px] h-6 bg-white/80 rounded"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Range Control Bar overlay */}
                    {selectedRange && (
                        <div className="bg-accent-green/5 border-t border-b border-accent-green/15 px-6 py-2 flex items-center justify-between gap-4 flex-shrink-0 animate-fade-in">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-accent-green animate-ping flex-shrink-0" />
                                <span className="font-mono text-xs text-gray-300">
                                    {lang === 'es' ? 'Rango Seleccionado:' : 'Selected Range:'} <strong className="text-white">{selectedRange.start.toFixed(2)}s</strong> - <strong className="text-white">{selectedRange.end.toFixed(2)}s</strong> ({lang === 'es' ? 'Duración:' : 'Duration:'} <strong className="text-accent-green">{(selectedRange.end - selectedRange.start).toFixed(2)}s</strong>)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={playSelection}
                                    className="px-2.5 py-1 bg-accent-green hover:bg-accent-green-hover text-black rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    {lang === 'es' ? 'Reproducir Selección' : 'Play Selection'}
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-gray-700/50"
                                >
                                    {lang === 'es' ? 'Limpiar' : 'Clear'}
                                </button>
                            </div>
                        </div>
                    )}

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

                            <button
                                onClick={handleRewind}
                                disabled={!isReady}
                                className="w-10 h-10 flex-shrink-0 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-transform disabled:opacity-50"
                                title={lang === 'es' ? 'Rebobinar al inicio' : 'Rewind to start'}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <div className="font-mono text-sm tracking-wider flex items-center gap-2">
                                <span className="text-accent-green font-medium min-w-[50px]">{currentTime}</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-gray-400 min-w-[50px]">{duration}</span>
                            </div>
                        </div>

                        {/* Tools Area (Zoom, Volume, Palette, Details, Screenshot) */}
                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 bg-[#121212] px-4 py-2 rounded-lg border border-gray-800/60">
                            {/* ColorMap Palette selector */}
                            <div className="flex items-center gap-1.5" title={lang === 'es' ? 'Paleta de colores' : 'Color Palette'}>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-1">{lang === 'es' ? 'Espectro' : 'Palette'}</span>
                                <div className="flex rounded bg-gray-900 p-0.5 border border-gray-800">
                                    <button
                                        onClick={() => setColorMapType('color')}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${colorMapType === 'color' ? 'bg-accent-green text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Color
                                    </button>
                                    <button
                                        onClick={() => setColorMapType('grayscale')}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${colorMapType === 'grayscale' ? 'bg-accent-green text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {lang === 'es' ? 'Gris' : 'Gray'}
                                    </button>
                                </div>
                            </div>

                            <div className="w-px h-6 bg-gray-800 hidden sm:block"></div>

                            {/* Hz/kHz unit selector */}
                            <div className="flex items-center gap-1.5" title="Unidad del espectrograma">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-1">Eje Y</span>
                                <div className="flex rounded bg-gray-900 p-0.5 border border-gray-800">
                                    <button
                                        onClick={() => setFrequencyUnit('Hz')}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${frequencyUnit === 'Hz' ? 'bg-accent-green text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Hz
                                    </button>
                                    <button
                                        onClick={() => setFrequencyUnit('kHz')}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${frequencyUnit === 'kHz' ? 'bg-accent-green text-black' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        kHz
                                    </button>
                                </div>
                            </div>

                            <div className="w-px h-6 bg-gray-800 hidden sm:block"></div>

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
                                    className="w-16 md:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-green"
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

                            <div className="w-px h-6 bg-gray-800 hidden sm:block"></div>

                            {/* Details Toggle Button */}
                            <button
                                onClick={() => setShowBottomDetails(!showBottomDetails)}
                                className={`p-1.5 rounded border transition-colors flex items-center gap-1.5 ${showBottomDetails
                                    ? 'bg-accent-green text-black border-accent-green'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-700/50'
                                    }`}
                                title={showBottomDetails ? "Ocultar ficha" : "Mostrar ficha"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                                <span className="text-[9px] font-black uppercase tracking-wider hidden md:inline">
                                    {showBottomDetails ? (lang === 'es' ? 'Ocultar Ficha' : 'Hide Details') : (lang === 'es' ? 'Mostrar Ficha' : 'Show Details')}
                                </span>
                            </button>

                            <div className="w-px h-6 bg-gray-800 hidden sm:block"></div>

                            {/* Capture Screenshot */}
                            <button
                                onClick={downloadCapture}
                                disabled={!isReady}
                                className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700/50 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Descargar captura en alta resolución"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent-green">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                                <span className="text-[9px] font-black uppercase tracking-wider hidden md:inline">Capturar</span>
                            </button>
                        </div>
                    </div>

                    {description && (
                        <div className="px-6 py-3 bg-[#111] border-t border-gray-900 text-[10px] text-gray-500 flex-shrink-0 flex items-center gap-2">
                            <span className="font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Nota:</span>
                            <span className="truncate">{description}</span>
                        </div>
                    )}

                    {/* Folding bottom details panel (exactly 40% height when open) */}
                    {isFullScreen && species && (
                        <div
                            className={`bg-[#0d0d0d] border-t border-gray-800 flex flex-col transition-all duration-300 ${showBottomDetails ? 'h-[40%] min-h-[220px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
                                } overflow-hidden`}
                        >
                            {/* Tab Header */}
                            <div className="px-6 py-2 bg-[#070707] border-b border-gray-800 flex items-center justify-between flex-shrink-0 select-none">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveDetailTab('info')}
                                        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all border ${activeDetailTab === 'info'
                                            ? 'bg-accent-green text-black border-accent-green'
                                            : 'text-gray-400 hover:text-white border-transparent'
                                            }`}
                                    >
                                        {lang === 'es' ? 'Ficha Técnica' : 'Technical Profile'}
                                    </button>
                                    <button
                                        onClick={() => setActiveDetailTab('multimedia')}
                                        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all border ${activeDetailTab === 'multimedia'
                                            ? 'bg-accent-green text-black border-accent-green'
                                            : 'text-gray-400 hover:text-white border-transparent'
                                            }`}
                                    >
                                        {lang === 'es' ? 'Análisis Visual' : 'Visual Analysis'}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowBottomDetails(false)}
                                    className="text-[9px] px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded uppercase font-bold tracking-wider transition-colors border border-gray-700/50"
                                >
                                    {lang === 'es' ? 'Ocultar' : 'Hide'}
                                </button>
                            </div>

                            {/* Tab Contents */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/25">
                                {activeDetailTab === 'info' ? (
                                    <div className="px-4">
                                        <div className="border border-gray-800 rounded-lg overflow-hidden bg-[#111] w-full">
                                            <table className="w-full text-left text-xs">
                                                <tbody className="divide-y divide-gray-800/50">
                                                    {[
                                                        { label: lang === 'es' ? 'Especie' : 'Species', value: species.scientificName },
                                                        { label: lang === 'es' ? 'Autor' : 'Author', value: species.databaseDetails?.identifiedBy || 'Desconocido' },
                                                        { label: lang === 'es' ? 'Fecha' : 'Date', value: species.databaseDetails?.occurrence_date },
                                                        { label: lang === 'es' ? 'Localidad' : 'Locality', value: species.location },
                                                        { label: lang === 'es' ? 'País' : 'Country', value: species.databaseDetails?.country || 'Perú' },
                                                        { label: 'ID Ocurrencia', value: species.databaseDetails?.occurrenceID },
                                                    ].filter(item => item.value).map((item, i) => (
                                                        <tr key={i} className="hover:bg-[#1a1a1a] transition-colors">
                                                            <td className="px-3 py-2 text-gray-500 font-medium w-1/3 border-r border-gray-800/50">{item.label}</td>
                                                            <td className="px-3 py-2 text-gray-300 font-medium break-all">{item.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    /* Multimedia Tab - Spectrogram associated specifically with the audio */
                                    <div className="px-4 w-full">
                                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] w-full">
                                            {allImages.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                                    {allImages.map((img, idx) => (
                                                        <div key={idx} className="bg-black/30 border border-gray-800 rounded-lg p-2.5 flex flex-col items-center gap-2 hover:border-accent-green/30 transition-colors">
                                                            <img src={img} alt="Espectrograma Asociado" className="max-h-24 object-contain rounded" />
                                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Espectrograma {idx + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-600 py-6">
                                                    <Music className="w-10 h-10 mx-auto mb-2 text-gray-700" />
                                                    <p className="text-xs uppercase tracking-widest font-bold">No hay análisis visuales específicos para este audio</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
