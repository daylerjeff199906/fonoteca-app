"use client"

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import { Play, Pause, Volume2, RotateCcw, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  description?: string;
}

export function AudioWaveform({
  audioUrl,
  title,
  artist,
  description
}: AudioWaveformProps) {
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
  const [showSpectrogram, setShowSpectrogram] = useState(true);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!waveformRef.current || !spectrogramRef.current || !timelineRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4f4f4f',
      progressColor: '#A3E635',
      cursorColor: '#ffffff',
      height: 60,
      barWidth: 2,
      barGap: 3,
      normalize: true,
      plugins: [
        Spectrogram.create({
          container: spectrogramRef.current,
          labels: true,
          height: 180,
          splitChannels: false,
          labelsColor: '#ffffff',
          labelsHzColor: '#888888',
        }),
        Timeline.create({
          container: timelineRef.current,
        }),
        Hover.create({
          lineColor: '#A3E635',
          lineWidth: 2,
          labelBackground: '#222',
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
    });

    ws.on('audioprocess', () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));

    return () => ws.destroy();
  }, [audioUrl]);

  const togglePlay = () => wavesurferRef.current?.playPause();

  const handleZoom = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    wavesurferRef.current?.zoom(newZoom * 20);
  };

  const handleVolume = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    wavesurferRef.current?.setVolume(newVol);
  };

  const handleReset = () => {
    wavesurferRef.current?.setTime(0);
  };

  return (
    <div className="w-full bg-[#0F0F0F] rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex flex-col">
      {/* Visualizer Area */}
      <div className="relative w-full bg-black flex flex-col p-6 gap-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-sm tracking-tight">{title || "Archivo de Audio"}</h4>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{artist || "Desconocido"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", showSpectrogram ? "text-primary bg-primary/10" : "text-white/40 hover:text-white")}
              onClick={() => setShowSpectrogram(!showSpectrogram)}
              title="Alternar Espectrograma"
            >
              <Waves className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn("transition-all duration-500 overflow-hidden", showSpectrogram ? "h-[200px] opacity-100 mb-4" : "h-0 opacity-0")}>
          <div ref={spectrogramRef} className="w-full h-full rounded-xl overflow-hidden" />
        </div>

        <div ref={timelineRef} className="w-full mb-2 opacity-50" />
        <div ref={waveformRef} className="w-full" />
      </div>

      {/* Controls Bar */}
      <div className="bg-[#1A1A1A] p-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            disabled={!isReady}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="font-mono text-xs tracking-widest flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
            <span className="text-primary font-bold min-w-[40px]">{currentTime}</span>
            <span className="text-white/20">/</span>
            <span className="text-white/60 min-w-[40px]">{duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-8 flex-1 max-w-sm">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={20}
              step={0.5}
              onValueChange={handleZoom}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-3 flex-1">
            <Volume2 className="h-3.5 w-3.5 text-white/40" />
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolume}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
