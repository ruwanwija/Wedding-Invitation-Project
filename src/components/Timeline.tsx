'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/lib/types';

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  // Sort events just in case
  const sortedEvents = [...events].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8">
      {/* Central Timeline Vertical Line */}
      <div className="absolute top-0 bottom-0 left-6 md:left-1/2 w-[2px] bg-gradient-to-b from-[#0B0B0B] via-gold-400 to-[#0B0B0B] -translate-x-1/2" />

      <div className="space-y-12 md:space-y-16">
        {sortedEvents.map((event, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div key={event.id} className="relative flex flex-col md:flex-row items-start md:items-center">
              
              {/* Timeline Indicator node */}
              <div className="absolute left-6 md:left-1/2 w-6 h-6 rounded-full bg-[#0B0B0B] border-4 border-gold-400 -translate-x-1/2 z-10 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
              </div>

              {/* Grid Wrapper */}
              <div className="w-full flex flex-col md:flex-row">
                
                {/* Left Side: Content or Image (alternates) */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:order-2 md:pl-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="glass-card p-6 rounded-3xl shadow-md border border-gold-400/20 relative hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Small tag for date */}
                    <span className="inline-block px-3 py-1 text-xs font-sans font-semibold tracking-widest text-gold-400 bg-gold-950/40 border border-gold-400/20 rounded-full mb-3 uppercase">
                      {event.event_date}
                    </span>
                    
                    <h4 className="text-xl font-serif font-semibold text-white mb-2">
                      {event.title}
                    </h4>
                    
                    <p className="text-sm font-sans leading-relaxed text-gold-100/70">
                      {event.description}
                    </p>
                  </motion.div>
                </div>

                {/* Right Side: Image or Content (alternates) */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 mt-4 md:mt-0 flex items-center justify-center ${isEven ? 'md:order-2 md:pl-12' : 'md:pr-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="w-full max-w-sm aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden border border-gold-400/20 shadow-md relative hover:scale-[1.02] transition-transform duration-300"
                  >
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 384px"
                        className="object-cover"
                        unoptimized // prevents issues if URLs are external
                      />
                    ) : (
                      <div className="w-full h-full bg-[#111111] flex items-center justify-center text-gold-400/40 font-serif italic text-sm">
                        No Image Available
                      </div>
                    )}
                  </motion.div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
