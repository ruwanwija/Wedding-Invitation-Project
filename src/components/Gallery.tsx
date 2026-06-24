'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { GalleryImage } from '@/lib/types';

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx]);

  const handlePrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx(selectedIdx === 0 ? images.length - 1 : selectedIdx - 1);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx(selectedIdx === images.length - 1 ? 0 : selectedIdx + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            onClick={() => setSelectedIdx(idx)}
            className="group relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-3xl cursor-pointer border border-gold-400/20 shadow-md hover:shadow-xl hover:border-gold-400/50 transition-all duration-300 bg-[#111111]"
          >
            {/* The Image */}
            <Image
              src={img.image_url}
              alt={img.caption || "Wedding Gallery"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 384px"
              className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-95"
              unoptimized
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <Maximize2 className="absolute top-4 right-4 text-gold-400 w-5 h-5" />
              {img.caption && (
                <p className="text-gold-200 text-sm font-serif tracking-wider font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {img.caption}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedIdx(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-6 right-6 text-gold-400 hover:text-white cursor-pointer bg-black/40 border border-gold-400/20 p-2 rounded-full backdrop-blur-sm z-55 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 md:left-8 text-gold-400 hover:text-white cursor-pointer bg-black/40 border border-gold-400/20 p-3 rounded-full backdrop-blur-sm z-55 transition-colors"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Lightbox Content wrapper */}
            <div 
              className="relative w-full max-w-4xl max-h-[80vh] aspect-[4/3] px-4 md:px-12 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={selectedIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gold-400/20"
              >
                <Image
                  src={images[selectedIdx].image_url}
                  alt={images[selectedIdx].caption || "Wedding Lightbox"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                  unoptimized
                />
              </motion.div>

              {/* Caption Display */}
              {images[selectedIdx].caption && (
                <motion.p
                  key={`cap-${selectedIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gold-200 text-center font-serif text-sm tracking-widest mt-6 bg-black/70 px-6 py-2 rounded-full border border-gold-400/20"
                >
                  {images[selectedIdx].caption}
                </motion.p>
              )}
            </div>

            {/* Right navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 md:right-8 text-gold-400 hover:text-white cursor-pointer bg-black/40 border border-gold-400/20 p-3 rounded-full backdrop-blur-sm z-55 transition-colors"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
