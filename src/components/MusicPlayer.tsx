'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface MusicPlayerProps {
  url: string;
}

export default function MusicPlayer({ url }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4); // Default volume 40%
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Retrieve stored preferences
    const storedVolume = localStorage.getItem('wedding-music-volume');
    const storedMute = localStorage.getItem('wedding-music-muted');
    
    if (storedVolume !== null) {
      setVolume(parseFloat(storedVolume));
    }
    if (storedMute !== null) {
      setIsMuted(storedMute === 'true');
    }

    // Instantiate audio object
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;
    audioRef.current.volume = storedMute === 'true' ? 0 : (storedVolume ? parseFloat(storedVolume) : 0.4);

    // Listen for custom start event (envelope unlock)
    const handleStartMusic = () => {
      if (audioRef.current && !isPlaying) {
        // Apply current volume
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e) => console.log("Autoplay blocked, waiting for manual interaction.", e));
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

  // Handle source URL changes
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

  // Handle manual volume slider adjustments
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    localStorage.setItem('wedding-music-volume', String(val));
    localStorage.setItem('wedding-music-muted', String(val === 0));
    
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (isMuted) {
        // Unmute
        setIsMuted(false);
        audioRef.current.volume = volume;
        localStorage.setItem('wedding-music-muted', 'false');
      } else {
        // Mute
        setIsMuted(true);
        audioRef.current.volume = 0;
        localStorage.setItem('wedding-music-muted', 'true');
      }
    } else {
      // If music hasn't started yet, play it
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          audioRef.current!.volume = volume;
        })
        .catch((e) => console.log(e));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none">
      {/* Soundwaves visualizer */}
      {isPlaying && !isMuted && (
        <div className="flex items-end gap-[3px] h-6 px-3 py-1 rounded-full bg-black/80 border border-gold-400/30 backdrop-blur-md shadow-lg transition-all duration-300">
          <div className="w-[3px] bg-gold-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
          <div className="w-[3px] bg-gold-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.3s', animationDuration: '1.1s' }} />
          <div className="w-[3px] bg-gold-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
          <div className="w-[3px] bg-gold-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }} />
        </div>
      )}

      {/* Floating expanded volume slider */}
      <div 
        className="flex items-center"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        <div 
          className={`flex items-center h-12 bg-black/80 border border-gold-400/30 rounded-l-full backdrop-blur-md px-4 shadow-lg transition-all duration-350 overflow-hidden ${
            showVolumeSlider ? 'max-w-[140px] opacity-100 border-r-0 translate-x-2' : 'max-w-0 opacity-0 pointer-events-none translate-x-4'
          }`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-gold-400 cursor-pointer h-1 bg-neutral-800 rounded-lg appearance-none"
            aria-label="Adjust Volume"
          />
        </div>

        {/* Main Music Control Button */}
        <button
          onClick={toggleMute}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg border border-gold-400/30 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 ${
            isPlaying && !isMuted
              ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-black hover:scale-105'
              : 'bg-black text-gold-400 hover:bg-neutral-900'
          }`}
          aria-label={isPlaying && !isMuted ? 'Mute Music' : 'Play Music'}
          title={isPlaying && !isMuted ? 'Mute Background Music' : 'Play Background Music'}
        >
          {/* Rotating Music Disc Icon (inside button) */}
          <div className={`absolute inset-0 rounded-full border border-dashed border-gold-400/20 scale-95 ${isPlaying && !isMuted ? 'animate-spin-slow' : ''}`} />
          
          {isPlaying && !isMuted ? (
            <Volume2 className="w-5 h-5 relative z-10" />
          ) : (
            <VolumeX className="w-5 h-5 relative z-10" />
          )}
        </button>
      </div>
    </div>
  );
}
