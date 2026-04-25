import React, { useEffect, useRef, useState } from 'react';
import { AudioPlayer } from './AudioPlayer';

interface AudioTrack {
    title: string;
    artist: string;
    url: string;
    image?: string;
    spectrogram?: string;
    images?: string[]; // Added image list
}

export const PersistentPlayer = () => {
    const [track, setTrack] = useState<AudioTrack | null>(null);
    const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [isVisible, setIsVisible] = useState(false);

    // Valid ref to manage autoplay intent
    const playOnLoad = useRef(false);

    // Track key for forcing recreation of AudioPlayer
    const [trackKey, setTrackKey] = useState<string>('');

    useEffect(() => {
        // Listen for custom events to play audio
        const handlePlayAudio = (event: CustomEvent<AudioTrack>) => {
            const newTrack = event.detail;
            console.log("📥 PersistentPlayer Received 'play-audio' event:", newTrack);
            setIsVisible(true);
            playOnLoad.current = true;
            setTrack(newTrack);
            setTrackKey(`${newTrack.url}-${Date.now()}`);
        };

        const handlePauseAudio = () => {
            console.log("⏸️ PersistentPlayer: Received pause event");
            // Logic if needed
        };

        const handleRewindAudio = () => {
             console.log("⏪ PersistentPlayer: Received rewind event");
        };

        // Listen for playlist initialization
        const handleSetPlaylist = (event: CustomEvent<{ playlist: AudioTrack[], startAtIndex?: number, autoplay?: boolean }>) => {
            const { playlist: newPlaylist, startAtIndex = 0, autoplay = false } = event.detail;
            setPlaylist(newPlaylist);
            if (newPlaylist.length > 0) {
                const startTrack = newPlaylist[startAtIndex];

                if (!track || track.url !== startTrack.url) {
                    setTrack(startTrack);
                    setCurrentIndex(startAtIndex);
                    if (autoplay) {
                        playOnLoad.current = true;
                        setTrackKey(`${startTrack.url}-${Date.now()}`);
                    } else {
                        playOnLoad.current = false;
                        setTrackKey(`${startTrack.url}-init`);
                    }
                }
            }
        };

        window.addEventListener('play-audio' as any, handlePlayAudio as any);
        window.addEventListener('pause-audio' as any, handlePauseAudio as any);
        window.addEventListener('rewind-audio' as any, handleRewindAudio as any);
        window.addEventListener('set-playlist' as any, handleSetPlaylist as any);
        return () => {
            window.removeEventListener('play-audio' as any, handlePlayAudio as any);
            window.removeEventListener('pause-audio' as any, handlePauseAudio as any);
            window.removeEventListener('rewind-audio' as any, handleRewindAudio as any);
            window.removeEventListener('set-playlist' as any, handleSetPlaylist as any);
        };
    }, []); // Empty dependency array for stability

    useEffect(() => {
        if (track && playlist.length > 0) {
            const idx = playlist.findIndex(t => t.url === track.url);
            if (idx !== -1) {
                setCurrentIndex(idx);
            }
        }
    }, [track, playlist]);

    useEffect(() => {
        const globalPlaylist = (window as any).FONOTECA_PLAYLIST;
        if (globalPlaylist && !track) {
            const { playlist: newPlaylist, startAtIndex = 0, autoplay = false } = globalPlaylist;
            setPlaylist(newPlaylist);
            if (newPlaylist.length > 0) {
                const startTrack = newPlaylist[startAtIndex];
                setTrack(startTrack);
                setCurrentIndex(startAtIndex);
                if (autoplay) {
                    playOnLoad.current = true;
                    setTrackKey(`${startTrack.url}-${Date.now()}`);
                } else {
                    playOnLoad.current = false;
                    setTrackKey(`${startTrack.url}-init`);
                }
            }
        }
    }, []);

    const playNext = () => {
        if (currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1;
            playOnLoad.current = true;
            setCurrentIndex(nextIndex);
            setTrack(playlist[nextIndex]);
            setTrackKey(`${playlist[nextIndex].url}-${Date.now()}`);
        }
    };

    const playPrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            playOnLoad.current = true;
            setCurrentIndex(prevIndex);
            setTrack(playlist[prevIndex]);
            setTrackKey(`${playlist[prevIndex].url}-${Date.now()}`);
        }
    };

    if (!track || !isVisible) {
        console.log("🛑 PersistentPlayer: NOT rendering (track/visibility condition not met)", { track: !!track, isVisible });
        return null;
    }

    console.log("✅ PersistentPlayer: RENDERING", track.title);
    return (
        <div className="relative z-[200]">
            <AudioPlayer
                key={trackKey || track.url}
                audioUrl={track.url}
                title={track.title}
                artist={track.artist}
                spectrogramImage={track.spectrogram || track.image}
                spectrogramImages={track.images}
                autoplay={playOnLoad.current}
                onFinish={playNext}
                isModalContainer={true}
                onNext={playNext}
                onPrev={playPrev}
                hasNext={currentIndex < playlist.length - 1}
                hasPrev={currentIndex > 0}
                onClose={() => setIsVisible(false)}
                layoutMode="direct"
            />
        </div>
    );
};
