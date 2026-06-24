'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FallingPetals from './FallingPetals';

interface EnvelopeProps {
  brideName: string;
  groomName: string;
  onOpenComplete: () => void;
}

export default function Envelope({ brideName, groomName, onOpenComplete }: EnvelopeProps) {
  const [dragged, setDragged] = useState(false);
  const [isOpenStarted, setIsOpenStarted] = useState(false);
  const [isFlapOpened, setIsFlapOpened] = useState(false);
  const [isCardSlidOut, setIsCardSlidOut] = useState(false);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);

  const sliderWidth = 240; // Slider travel distance
  const dragX = useMotionValue(0);
  const sliderOpacity = useTransform(dragX, [0, sliderWidth - 40], [1, 0.1]);
  const sliderWidthVal = useTransform(dragX, (v) => v + 40);

  // Audio refs for sound effects
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio sound effect
    chimeAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav');
    chimeAudioRef.current.volume = 0.45;
  }, []);

  const triggerOpenSequence = () => {
    if (isOpenStarted) return;
    setIsOpenStarted(true);

    // Play soft luxurious sound effect
    if (chimeAudioRef.current) {
      chimeAudioRef.current.play().catch(err => console.log('Sound autoplay blocked by browser settings.', err));
    }

    // Step 1: Break seal
    setTimeout(() => {
      // Step 2: Open Flap (3D flip)
      setIsFlapOpened(true);

      setTimeout(() => {
        // Step 3: Card slides out
        setIsCardSlidOut(true);

        setTimeout(() => {
          // Step 4: Card expands and website reveals
          setIsFullyRevealed(true);
          setTimeout(() => {
            onOpenComplete();
          }, 1200); // Wait for transition fade
        }, 1500);
      }, 1000);
    }, 600);
  };

  const handleDragEnd = () => {
    const currentX = dragX.get();
    if (currentX >= sliderWidth - 55) {
      setDragged(true);
      triggerOpenSequence();
    } else {
      // Snap back
      dragX.set(0);
    }
  };

  const monogram = `${brideName[0] || 'B'}&${groomName[0] || 'G'}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center overflow-hidden bg-[#0C0C0C] paper-texture select-none">
      {/* Background cinematic lighting/gradients */}
      <div className="absolute inset-0 bg-radial from-[#1A150E] via-[#0B0B0B] to-[#050505] opacity-90 z-0" />
      
      {/* Soft cinematic gold spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Floating golden particles */}
      <FallingPetals />

      <AnimatePresence>
        {!isFullyRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: 'easeInOut' } }}
            className="relative z-10 flex flex-col items-center justify-center w-full px-4 max-w-4xl"
          >
            {/* Header Serif Text */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-center mb-10 sm:mb-14"
            >
              <span className="font-serif italic text-gold-200/60 tracking-[0.25em] text-xs sm:text-sm uppercase block mb-3">
                Together with their families
              </span>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-gold-400 tracking-widest font-semibold mt-1">
                {brideName} & {groomName}
              </h2>
              <div className="flex justify-center items-center gap-3 mt-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/45" />
                <span className="font-serif italic text-[#F3ECD8]/70 text-xs sm:text-sm tracking-wider">
                  Invite You to Celebrate Their Union
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/45" />
              </div>
            </motion.div>

            {/* 3D Envelope Container */}
            <div className="relative w-full max-w-[340px] sm:max-w-[480px] md:max-w-[540px] aspect-[1.5] perspective-[1200px] mb-12 sm:mb-16">
              
              {/* Envelope Back/Body Plate */}
              <div className="absolute inset-0 bg-[#161616] rounded-2xl border border-[#D4AF37]/25 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* Gold foil border inside body */}
                <div className="absolute inset-2 sm:inset-3 border border-[#D4AF37]/15 rounded-xl pointer-events-none" />
                {/* Paper texture shadow layers */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20 pointer-events-none" />
              </div>

              {/* INVITATION CARD (Slides out upwards) */}
              <motion.div
                initial={{ y: 0, scale: 0.95 }}
                animate={{
                  y: isCardSlidOut ? '-65%' : 0,
                  scale: isCardSlidOut ? 1.02 : 0.95,
                  zIndex: isCardSlidOut ? 20 : 5
                }}
                transition={{
                  y: { type: 'spring', stiffness: 80, damping: 15 },
                  scale: { duration: 0.5 }
                }}
                className="absolute inset-2 sm:inset-3 bg-[#111111] rounded-xl border border-[#D4AF37]/35 shadow-2xl flex flex-col justify-center items-center p-6 text-center select-none"
              >
                {/* Gold foil pattern inside card */}
                <div className="absolute inset-1.5 sm:inset-2 border-2 border-[#D4AF37]/20 rounded-lg pointer-events-none" />
                <div className="absolute inset-2.5 sm:inset-3 border border-[#D4AF37]/10 rounded-md pointer-events-none" />

                <span className="font-serif italic text-gold-300/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 block">
                  The Honor of Your Presence
                </span>
                
                {/* Monogram Crest */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-[#D4AF37]/30 flex items-center justify-center my-3 relative">
                  <div className="absolute inset-0.5 rounded-full border border-dashed border-[#D4AF37]/15" />
                  <span className="font-display text-sm sm:text-lg text-gold-400 font-bold tracking-widest">{monogram}</span>
                </div>

                <h3 className="font-display text-lg sm:text-2xl text-white font-bold tracking-widest uppercase my-1">
                  Save The Date
                </h3>
                
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent my-2" />
                
                <p className="font-serif text-[#F3ECD8]/90 text-[11px] sm:text-sm tracking-wider max-w-xs leading-relaxed italic">
                  &ldquo;A celebration of love, friendship, and family. Join us as we start our forever.&rdquo;
                </p>
              </motion.div>

              {/* Envelope Flap (Top Fold) */}
              <motion.div
                style={{ originY: 0 }}
                animate={{ rotateX: isFlapOpened ? 180 : 0 }}
                transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                className="absolute left-0 right-0 top-0 h-[50%] bg-[#1E1E1E] rounded-t-2xl z-15 border-x border-[#D4AF37]/25 shadow-md flex items-end justify-center pointer-events-none"
              >
                {/* Triangular diagonal cut styling */}
                <div className="absolute inset-0 bg-[#1D1D1D] rounded-t-2xl border-t border-[#D4AF37]/25 pointer-events-none" />
                
                {/* Dynamic SVG diagonal lines simulating fold flap edges */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="0,0 50,85 100,0" fill="#1C1C1C" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="0.5" />
                </svg>
              </motion.div>

              {/* Envelope Front Left & Right Fold Panels (Simulated with SVGs) */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Left flap triangle */}
                  <polygon points="0,0 0,100 50,55" fill="#181818" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="0.3" />
                  {/* Right flap triangle */}
                  <polygon points="100,0 100,100 50,55" fill="#181818" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="0.3" />
                  {/* Bottom flap triangle */}
                  <polygon points="0,100 100,100 50,53" fill="#141414" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="0.3" />
                </svg>
              </div>

              {/* WAX SEAL (Centered) */}
              <motion.div
                animate={{
                  scale: isOpenStarted ? [1, 1.2, 0] : 1,
                  rotate: isOpenStarted ? [0, -10, 20] : 0,
                  opacity: isOpenStarted ? [1, 1, 0] : 1,
                }}
                transition={{ duration: 0.7, times: [0, 0.3, 1] }}
                className="absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 z-25 w-14 h-14 sm:w-18 sm:h-18 cursor-pointer filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
              >
                {/* Wax Seal SVG */}
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  {/* Outer melting border */}
                  <path
                    d="M50 4C24.6 4 4 24.6 4 50C4 53.5 4.4 57 5.2 60.3C6.3 64.8 9.5 68.6 13.7 70.8C16.8 72.4 17.5 76 17.2 79.4C16.8 83.9 19.3 88.2 23.3 90.3C26.5 92 28.5 95 28.2 98.6C30.7 99 33.3 99.2 36 99.2C39.1 99.2 41.5 97.2 43.8 95.3C47.7 92.1 52.3 92.1 56.2 95.3C58.5 97.2 60.9 99.2 64 99.2C66.7 99.2 69.3 99 71.8 98.6C71.5 95 73.5 92 76.7 90.3C80.7 88.2 83.2 83.9 82.8 79.4C82.5 76 83.2 72.4 86.3 70.8C90.5 68.6 93.7 64.8 94.8 60.3C95.6 57 96 53.5 96 50C96 24.6 75.4 4 50 4Z"
                    fill="url(#goldWax)"
                  />
                  {/* Inner ring */}
                  <circle cx="50" cy="50" r="34" stroke="#856E21" strokeWidth="2" fill="none" opacity="0.6" />
                  <circle cx="50" cy="50" r="32" fill="url(#goldWaxInner)" />
                  {/* Custom initials inside seal */}
                  <text
                    x="50"
                    y="57"
                    fontFamily="var(--font-cinzel), serif"
                    fontSize="22"
                    fontWeight="bold"
                    fill="#4D3B0E"
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    {monogram.replace('&', '')}
                  </text>
                  {/* Glow filter definition */}
                  <defs>
                    <radialGradient id="goldWax" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFF2B2" />
                      <stop offset="35%" stopColor="#D4AF37" />
                      <stop offset="85%" stopColor="#A08628" />
                      <stop offset="100%" stopColor="#514214" />
                    </radialGradient>
                    <linearGradient id="goldWaxInner" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFF2B2" />
                      <stop offset="60%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#856E21" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

            </div>

            {/* UNLOCK SLIDER (Drag left to right) */}
            <motion.div
              style={{ opacity: sliderOpacity }}
              animate={isOpenStarted ? { scale: 0.9, opacity: 0 } : {}}
              className="relative w-full max-w-[280px] h-12 rounded-full border border-[#D4AF37]/30 bg-black/40 backdrop-blur-md p-1 flex items-center justify-start overflow-hidden shadow-lg animate-float-slow"
            >
              {/* Slider Track Info Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-serif italic text-gold-100/65 text-xs tracking-widest uppercase">
                  Slide to Open
                </span>
              </div>

              {/* Slider Fill (Shows drag progress) */}
              <motion.div
                style={{ width: sliderWidthVal }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-transparent to-[#D4AF37]/15 rounded-full pointer-events-none"
              />

              {/* Drag handle */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: sliderWidth - 40 }}
                dragElastic={0.05}
                dragMomentum={false}
                style={{ x: dragX }}
                onDrag={(_, info) => {
                  if (info.offset.x >= sliderWidth - 50) {
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                      window.navigator.vibrate(50);
                    }
                  }
                }}
                onDragEnd={handleDragEnd}
                animate={dragged ? { x: sliderWidth - 40 } : {}}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFF2B2] via-[#D4AF37] to-[#A08628] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10"
              >
                <ArrowRight className="w-5 h-5 text-[#3A2D0C]" />
              </motion.div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
