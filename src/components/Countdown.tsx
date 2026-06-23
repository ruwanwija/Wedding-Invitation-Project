'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:MM
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export default function Countdown({ targetDate, targetTime }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTime = () => {
      const targetStr = `${targetDate}T${targetTime}:00`;
      const target = new Date(targetStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (isNaN(target) || difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (!mounted) {
    // Return empty skeleton during SSR to avoid hydration mismatches
    return (
      <div className="flex gap-4 md:gap-8 justify-center items-center py-6 min-h-[140px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-16 h-20 md:w-24 md:h-28 rounded-2xl bg-white/40 animate-pulse border border-white/20" />
        ))}
      </div>
    );
  }

  if (timeRemaining.isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 px-6 glass-card rounded-3xl border border-gold-200/30 max-w-xl mx-auto shadow-xl"
      >
        <h3 className="text-2xl md:text-3xl font-display text-gold-600 mb-2">The Celebration Has Begun!</h3>
        <p className="text-gray-600 font-sans italic">Thank you for sharing in our love and happiness.</p>
      </motion.div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeRemaining.days },
    { label: 'Hours', value: timeRemaining.hours },
    { label: 'Minutes', value: timeRemaining.minutes },
    { label: 'Seconds', value: timeRemaining.seconds }
  ];

  return (
    <div className="flex gap-3 sm:gap-4 md:gap-8 justify-center items-center py-4">
      {timeBlocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          {/* Countdown block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 glass-card rounded-2xl sm:rounded-3xl border border-white/40 shadow-lg relative overflow-hidden"
          >
            {/* Top gold shine line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />
            
            {/* Value with subtle transition */}
            <div className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-gold-600 md:leading-tight">
              {String(block.value).padStart(2, '0')}
            </div>
            
            <div className="text-[10px] sm:text-xs font-sans tracking-widest text-[#5A5A5A] uppercase mt-1">
              {block.label}
            </div>
          </motion.div>
          
          {/* Separator dots */}
          {idx < 3 && (
            <span className="text-xl sm:text-2xl md:text-4xl font-serif text-gold-400 animate-pulse hidden xs:inline">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
