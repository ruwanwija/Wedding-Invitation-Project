'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Camera, 
  Utensils, 
  Music, 
  Clock, 
  Sparkles,
  Award
} from 'lucide-react';
import { ProgramItem } from '@/lib/types';

interface ProgramProps {
  items: ProgramItem[];
}

export default function Program({ items }: ProgramProps) {
  // Sort items by sort_order
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);

  // Helper to get matching icon
  const getIcon = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes('guest') || t.includes('arrival') || t.includes('welcome')) return <Users className="w-5 h-5" />;
    if (t.includes('ceremony') || t.includes('vow') || t.includes('wedding') || t.includes('solemnization')) return <Heart className="w-5 h-5" />;
    if (t.includes('photo') || t.includes('shoot') || t.includes('camera') || t.includes('session')) return <Camera className="w-5 h-5" />;
    if (t.includes('reception') || t.includes('dinner') || t.includes('lunch') || t.includes('food') || t.includes('feast')) return <Utensils className="w-5 h-5" />;
    if (t.includes('cake') || t.includes('cutting') || t.includes('sweet')) return <Award className="w-5 h-5" />; // A nice alternative
    if (t.includes('dance') || t.includes('party') || t.includes('closing') || t.includes('music') || t.includes('dj')) return <Music className="w-5 h-5" />;
    
    // Default icons based on index to keep it colorful and varied
    const defaults = [
      <Clock className="w-5 h-5" />,
      <Sparkles className="w-5 h-5" />,
      <Heart className="w-5 h-5" />
    ];
    return defaults[index % defaults.length];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="relative border-l border-gold-200 ml-4 md:ml-32 pl-8 space-y-12">
        {sortedItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            className="relative"
          >
            {/* Absolute positioning of the time block on larger screens */}
            <div className="md:absolute md:top-0 md:-left-44 md:w-32 md:text-right hidden md:block">
              <div className="text-lg font-serif font-bold text-gold-600 tracking-wider">
                {item.event_time}
              </div>
              <div className="text-[10px] font-sans text-gray-400 uppercase tracking-widest mt-1">
                Scheduled
              </div>
            </div>

            {/* Program Node Icon */}
            <div className="absolute -left-13 top-0.5 w-10 h-10 rounded-full bg-white border-2 border-gold-400 flex items-center justify-center text-gold-500 shadow-md z-10">
              {getIcon(item.title, idx)}
            </div>

            {/* Time label on Mobile */}
            <div className="inline-block px-3 py-0.5 bg-gold-100 text-gold-700 rounded-full font-serif text-sm font-semibold tracking-wider mb-2 md:hidden">
              {item.event_time}
            </div>

            {/* Card Content */}
            <div className="glass-card p-6 rounded-2xl border border-white/60 hover:border-gold-200/40 hover:shadow-md transition-all duration-300">
              <h4 className="text-lg font-serif font-bold text-[#2D2D2D] mb-1">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm font-sans leading-relaxed text-[#5A5A5A]">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
