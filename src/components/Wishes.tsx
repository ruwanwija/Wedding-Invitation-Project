'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, User, MessageSquare } from 'lucide-react';
import { GuestWish } from '@/lib/types';
import { getWishes, addWish } from '@/lib/db';

interface WishesProps {
  initialWishes: GuestWish[];
}

export default function Wishes({ initialWishes }: WishesProps) {
  const [wishes, setWishes] = useState<GuestWish[]>(initialWishes);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Refetch wishes periodically or on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getWishes();
        setWishes(data);
      } catch (err) {
        console.error("Failed to load wishes", err);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    // Create optimistic wish
    const optimisticWish: GuestWish = {
      id: 'optimistic-' + Math.random().toString(),
      name: name.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Prepend to list immediately
    setWishes(prev => [optimisticWish, ...prev]);

    try {
      const realWish = await addWish(name.trim(), message.trim());
      
      // Replace optimistic wish with real one
      setWishes(prev => prev.map(w => w.id === optimisticWish.id ? realWish : w));
      
      setName('');
      setMessage('');
      setStatus('success');
    } catch (err) {
      console.error(err);
      // Remove optimistic wish on error
      setWishes(prev => prev.filter(w => w.id !== optimisticWish.id));
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Wish Submission Form (Left Column) */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />
            
            <h3 className="text-2xl font-serif font-bold text-[#2D2D2D] mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-gold-500 fill-rose-gold-400" />
              Send Your Blessings
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-sans font-semibold tracking-wider text-[#5A5A5A] uppercase mb-2" htmlFor="guest-name">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gold-500" />
                  <input
                    id="guest-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold tracking-wider text-[#5A5A5A] uppercase mb-2" htmlFor="guest-message">
                  Blessing Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gold-500" />
                  <textarea
                    id="guest-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your wishes for the happy couple..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-200/50 bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all font-sans text-sm resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-serif font-semibold tracking-wide hover:from-gold-600 hover:to-gold-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Send Wishes'}
                <Send className="w-4 h-4" />
              </button>
            </form>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center text-xs font-sans"
                >
                  Thank you! Your blessing has been added to the wishes wall.
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center text-xs font-sans"
                >
                  Something went wrong. Please try again.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Wishes Display Wall (Right Columns) */}
        <div className="lg:col-span-7">
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 rounded-2xl">
            <AnimatePresence initial={false}>
              {wishes.length === 0 ? (
                <div className="text-center py-12 bg-white/40 rounded-2xl border border-dashed border-gold-200/50 font-serif italic text-gray-500">
                  Be the first to write a blessing!
                </div>
              ) : (
                wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="glass-card p-5 rounded-2xl border border-white/60 relative hover:border-gold-200/30 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-serif font-bold text-gold-700 tracking-wide text-sm">
                        {wish.name}
                      </h4>
                      <span className="text-[10px] font-sans text-gray-400">
                        {formatDate(wish.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-[#5A5A5A] leading-relaxed italic">
                      &ldquo;{wish.message}&rdquo;
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
