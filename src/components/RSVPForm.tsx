'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Users, MessageSquare, Check, X } from 'lucide-react';
import { Guest } from '@/lib/types';
import { adminApi } from '@/lib/admin/api';

interface RSVPFormProps {
  guest: Guest | null;
  onRsvpSubmit: (updatedGuest: Guest) => void;
}

export default function RSVPForm({ guest, onRsvpSubmit }: RSVPFormProps) {
  const [status, setStatus] = useState<'attending' | 'declined' | null>(
    guest?.rsvp_status || null
  );
  const [guestsCount, setGuestsCount] = useState<number>(
    guest?.rsvp_guests_count || 1
  );
  const [message, setMessage] = useState<string>(guest?.rsvp_message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (guest) {
      setStatus(guest.rsvp_status || null);
      setGuestsCount(guest.rsvp_guests_count || 1);
      setMessage(guest.rsvp_message || '');
    }
  }, [guest]);

  if (!guest) {
    return (
      <section className="py-24 px-6 text-center bg-[#0B0B0B] border-t border-gold-400/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="luxury-heading text-3xl md:text-4xl mb-3">RSVP</h2>
            <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">
              Confirm Your Attendance
            </p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
          </div>

          <div className="glass-card max-w-xl mx-auto p-8 rounded-[35px] border border-gold-400/20 bg-black/30 backdrop-blur-xs relative overflow-hidden">
            <Calendar className="w-8 h-8 text-gold-400/60 mx-auto mb-4" />
            <p className="font-serif italic text-gold-100/70 text-sm leading-relaxed">
              This is a personalized wedding invitation. Please open your unique invitation link to RSVP.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Determine max attending guests count based on invitation type
  let maxGuests = 1;
  let typeLabel = 'Individual';
  if (guest.invitation_type === 'spouse') {
    maxGuests = 2;
    typeLabel = 'Guest & Partner';
  } else if (guest.invitation_type === 'family') {
    maxGuests = 5;
    typeLabel = 'Family';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setErrorMsg('Please select your RSVP status.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Local fallback support
      const isSupabase =
        typeof window !== 'undefined' &&
        window.localStorage.getItem('guests') !== null;

      if (!isSupabase && guest.id.startsWith('w-') || guest.id.length < 15) {
        // Fallback for mocked local storage mode
        const stored = localStorage.getItem('guests');
        const list: Guest[] = stored ? JSON.parse(stored) : [];
        const index = list.findIndex((g) => g.id === guest.id);
        const updated: Guest = {
          ...guest,
          rsvp_status: status,
          rsvp_guests_count: status === 'attending' ? guestsCount : 0,
          rsvp_message: message || null,
          rsvp_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (index !== -1) {
          list[index] = updated;
          localStorage.setItem('guests', JSON.stringify(list));
        }
        
        onRsvpSubmit(updated);
        setSuccess(true);
      } else {
        // Production API call
        const updated = await adminApi.submitRsvp({
          token: guest.invitation_token,
          status,
          guestsCount: status === 'attending' ? guestsCount : 0,
          message,
        });

        // Trigger parent state synchronization
        onRsvpSubmit(updated);
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendingOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);

  return (
    <section className="py-24 px-6 text-center bg-[#0B0B0B] border-t border-gold-400/10 relative overflow-hidden">
      {/* Decorative gold background glow */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-t from-[#D4AF37]/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">RSVP</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">
            Kindly Respond by September 1, 2026
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        <div className="glass-card max-w-2xl mx-auto p-8 sm:p-12 rounded-[40px] border border-gold-400/20 bg-black/40 backdrop-blur-md shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="font-display text-2xl text-gold-400 tracking-wider uppercase font-semibold">
                  RSVP Confirmed
                </h3>
                <p className="font-serif italic text-white/95 text-base max-w-md mx-auto leading-relaxed">
                  Dear {guest.guest_name}, thank you for responding! Your attendance status has been successfully updated. We look forward to celebrating this beautiful day with you.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-xs text-gold-400 font-sans tracking-widest hover:text-gold-300 hover:underline uppercase cursor-pointer"
                >
                  Change Response
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Greeting */}
                <div className="text-center sm:text-left mb-2">
                  <span className="font-serif italic text-gold-300/80 text-xs tracking-wider uppercase block mb-1">
                    Invitation For {typeLabel}
                  </span>
                  <h3 className="font-serif text-white font-bold text-xl sm:text-2xl tracking-wide">
                    {guest.guest_name}
                  </h3>
                </div>

                <div className="w-full h-[1px] bg-gold-400/10" />

                {/* RSVP Choice Toggle */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-gold-300 uppercase mb-2">
                    Will You Attend?
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('attending')}
                      className={`flex-1 py-3 px-6 rounded-xl border font-serif uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        status === 'attending'
                          ? 'bg-gold-500/15 border-gold-400 text-gold-200 font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={`flex-1 py-3 px-6 rounded-xl border font-serif uppercase tracking-widest text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        status === 'declined'
                          ? 'bg-red-500/10 border-red-500/50 text-red-300 font-bold'
                          : 'border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Regretfully Decline
                    </button>
                  </div>
                </div>

                {/* Dynamic Guest Count Input */}
                {status === 'attending' && maxGuests > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-[10px] font-sans font-bold tracking-widest text-gold-300 uppercase mb-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Number of Attending Guests
                      </span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gold-400/20 rounded-xl bg-zinc-900 focus:outline-none text-sm text-white focus:border-gold-400/50 transition-colors"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                    >
                      {attendingOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt} {opt === 1 ? 'Guest' : 'Guests'} (Max {maxGuests})
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-gold-300 uppercase mb-2">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Wishes or Special Notes
                    </span>
                  </label>
                  <textarea
                    placeholder="Wishes for the couple, dietary requirements, or notes..."
                    className="w-full px-4 py-3 border border-gold-400/20 rounded-xl bg-zinc-900/60 focus:outline-none text-sm text-white focus:border-gold-400/50 transition-all resize-none"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !status}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-[#3A2D0C] font-serif uppercase font-bold tracking-widest text-[10px] sm:text-xs transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)] disabled:opacity-50 cursor-pointer text-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
