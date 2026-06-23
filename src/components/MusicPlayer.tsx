'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface MusicPlayerProps {
  url: string;
}

export default function MusicPlayer({ url }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Instantiate audio object on mount
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Listen for custom start event
    const handleStartMusic = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((e) => console.log("Audio autoplay prevented, waiting for user click.", e));
      }
    };

    window.addEventListener('play-wedding-music', handleStartMusic);

    return () => {
      window.removeEventListener('play-wedding-music', handleStartMusic);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  // Handle URL change dynamically
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = url;
      if (wasPlaying) {
        audioRef.current.play().catch((e) => console.log(e));
      }
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((e) => console.log(e));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Soundwaves visualizer */}
      {isPlaying && (
        <div className="flex items-end gap-[3px] h-6 px-3 py-1 rounded-full bg-white/80 border border-gold-200/50 backdrop-blur-md shadow-lg transition-all duration-300">
          <div className="w-[3px] bg-gold-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
          <div className="w-[3px] bg-gold-500 rounded-full animate-bounce h-5" style={{ animationDelay: '0.3s', animationDuration: '1.1s' }} />
          <div className="w-[3px] bg-gold-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
          <div className="w-[3px] bg-gold-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }} />
        </div>
      )}

      {/* Main Music Control Button */}
      <button
        onClick={togglePlay}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg border border-gold-300/40 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 ${
          isPlaying
            ? 'bg-gold-500 text-white hover:bg-gold-600 scale-105'
            : 'bg-white text-gold-600 hover:bg-gold-50 hover:text-gold-700'
        }`}
        aria-label={isPlaying ? 'Mute Music' : 'Play Music'}
        title={isPlaying ? 'Mute Background Music' : 'Play Background Music'}
      >
        {/* Rotating Music Disc Icon (inside button) */}
        <div className={`absolute inset-0 rounded-full border border-dashed border-gold-200/30 scale-95 ${isPlaying ? 'animate-spin-slow' : ''}`} />
        
        {isPlaying ? (
          <Volume2 className="w-5 h-5 relative z-10" />
        ) : (
          <VolumeX className="w-5 h-5 relative z-10" />
        )}
      </button>
    </div>
  );
}
