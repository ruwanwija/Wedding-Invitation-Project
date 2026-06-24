'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Music, 
  Heart, 
  Gift, 
  Menu, 
  X, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';

import { WeddingSettings, TimelineEvent, ProgramItem, GalleryImage, GuestWish } from '@/lib/types';
import FallingPetals from './FallingPetals';
import MusicPlayer from './MusicPlayer';
import Countdown from './Countdown';
import Timeline from './Timeline';
import Program from './Program';
import Gallery from './Gallery';
import Wishes from './Wishes';
import Envelope from './Envelope';

interface WeddingClientAppProps {
  initialSettings: WeddingSettings;
  initialTimeline: TimelineEvent[];
  initialProgram: ProgramItem[];
  initialGallery: GalleryImage[];
  initialWishes: GuestWish[];
}

export default function WeddingClientApp({
  initialSettings,
  initialTimeline,
  initialProgram,
  initialGallery,
  initialWishes
}: WeddingClientAppProps) {
  const [settings, setSettings] = useState<WeddingSettings>(initialSettings);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [scrolled, setScrolled] = useState(false);
  const [isOpenedInvitation, setIsOpenedInvitation] = useState(false); // Splash overlay state

  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const coupleRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const wishesRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);

  // Monitor scroll to update header styles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setIsOpen(false);
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handled inside envelope complete callback

  // Format Date for display (e.g. Sunday, September 20, 2026)
  const formatWeddingDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format Time for display (e.g. 4:00 PM)
  const formatWeddingTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      return `${formattedH}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };



  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-white overflow-x-hidden">
      {/* Floating gold dust particles canvas */}
      <FallingPetals />

      {/* Floating Background Music Player */}
      <MusicPlayer url={settings.musicUrl} />

      {/* Luxury Envelope Screen Overlay */}
      <AnimatePresence>
        {!isOpenedInvitation && (
          <Envelope
            brideName={settings.brideName}
            groomName={settings.groomName}
            onOpenComplete={() => {
              setIsOpenedInvitation(true);
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('play-wedding-music'));
              }, 150);
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Cinematic Wedding Story Content */}
      <div className={`transition-all duration-1000 ${isOpenedInvitation ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>

      {/* ==========================================
          SECTION 1: HERO BANNER (Cinematic Redesign)
         ========================================== */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden select-none"
      >
        {/* Full-screen Autoplay Cinematic Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source 
            src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054f4d823a073f396e95d013e217741&profile_id=165&oauth2_token_id=57447761" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dark Golden Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-[#0B0B0B] z-10 pointer-events-none" />
        
        {/* Animated Banner Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          className="relative z-20 max-w-3xl p-8 sm:p-12 md:p-16 border border-gold-400/20 backdrop-blur-xs rounded-[50px] shadow-2xl bg-black/40"
        >
          {/* Top Flourish */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
            <Heart className="w-5 h-5 text-gold-400 fill-gold-400/10" />
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
          </div>

          <h5 className="text-gold-200/80 font-serif tracking-[0.25em] text-xs sm:text-sm uppercase mb-4">
            Save The Date
          </h5>

          {/* Groom & Bride Names */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-widest text-gold-400 mb-6 drop-shadow-md">
            {settings.brideName} <span className="text-white font-serif italic text-3xl sm:text-5xl">&amp;</span> {settings.groomName}
          </h1>

          <p className="text-white/90 font-serif text-sm sm:text-base md:text-lg max-w-xl mx-auto italic leading-relaxed mb-8">
            &ldquo;Together with our families, we warmly invite you to celebrate our wedding and share in our happiness.&rdquo;
          </p>

          {/* Date & Time info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gold-100/90 font-serif text-sm sm:text-base tracking-widest uppercase mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              {settings.weddingDate}
            </span>
            <span className="hidden sm:inline text-gold-400/50">|</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              {formatWeddingTime(settings.weddingTime)}
            </span>
          </div>

          <div className="text-[10px] font-sans tracking-[0.2em] text-gold-200/50 uppercase mt-8 animate-bounce">
            Scroll Down to Discover
          </div>
        </motion.div>
      </section>

      {/* ==========================================
          SECTION 2: COUNTDOWN TIMER
         ========================================== */}
      <section className="bg-[#0B0B0B] py-16 px-6 border-b border-gold-400/10 text-center relative">
        <div className="max-w-4xl mx-auto relative z-20">
          <h2 className="luxury-heading text-xs tracking-[0.25em] uppercase mb-4">
            Counting Down To Our Big Day
          </h2>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-8" />
          <Countdown targetDate={settings.weddingDate} targetTime={settings.weddingTime} />
        </div>
      </section>

      {/* ==========================================
          SECTION 3: BRIDE & GROOM
         ========================================== */}
      <section ref={coupleRef} className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">The Happy Couple</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">Bride &amp; Groom Biographies</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Bride Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-[40px] overflow-hidden border border-gold-400/20 shadow-xl flex flex-col transition-all duration-300 relative group"
          >
            {/* Luxury gold top line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300" />
            
            {/* Bio Photo with Gold Border Inner Frame */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950 p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gold-400/30">
                <Image
                  src="https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80"
                  alt={settings.brideFullName}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
                  unoptimized
                />
              </div>
            </div>
            
            {/* Bio Details */}
            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-2">
                  {settings.brideFullName}
                </h3>
                <p className="text-xs font-serif tracking-[0.2em] text-gold-200/60 uppercase mb-4">
                  The Bride
                </p>
                <p className="text-sm font-sans leading-relaxed text-gold-100/70 italic mb-6">
                  &ldquo;{settings.brideIntro}&rdquo;
                </p>
              </div>
              
              <div className="border-t border-gold-400/10 pt-6">
                <p className="text-xs font-sans font-semibold tracking-wider text-gold-200/40 uppercase mb-1">
                  Cherished Daughter Of
                </p>
                <p className="text-sm font-serif font-bold text-white">
                  Mr. {settings.brideFather} &amp; Mrs. {settings.brideMother}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Groom Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="glass-card rounded-[40px] overflow-hidden border border-gold-400/20 shadow-xl flex flex-col transition-all duration-300 relative group"
          >
            {/* Luxury gold top line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300" />
            
            {/* Bio Photo with Gold Border Inner Frame */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950 p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gold-400/30">
                <Image
                  src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80"
                  alt={settings.groomFullName}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
                  unoptimized
                />
              </div>
            </div>

            {/* Bio Details */}
            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-2">
                  {settings.groomFullName}
                </h3>
                <p className="text-xs font-serif tracking-[0.2em] text-gold-200/60 uppercase mb-4">
                  The Groom
                </p>
                <p className="text-sm font-sans leading-relaxed text-gold-100/70 italic mb-6">
                  &ldquo;{settings.groomIntro}&rdquo;
                </p>
              </div>

              <div className="border-t border-gold-400/10 pt-6">
                <p className="text-xs font-sans font-semibold tracking-wider text-gold-200/40 uppercase mb-1">
                  Cherished Son Of
                </p>
                <p className="text-sm font-serif font-bold text-white">
                  Mr. {settings.groomFather} &amp; Mrs. {settings.groomMother}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4: FAMILIES & BLESSINGS
         ========================================== */}
      <section className="bg-[#111111]/30 py-20 px-6 border-y border-gold-400/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="luxury-heading text-2xl md:text-3xl mb-3">Family Blessings</h2>
            <p className="text-xs font-sans tracking-widest text-gold-200/60 uppercase">Words from our Parents</p>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bride's Family Blessing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-gold-400/20 shadow-md flex flex-col justify-between"
            >
              <p className="text-sm font-sans leading-relaxed text-gold-100/80 italic mb-6">
                &ldquo;{settings.brideFamilyBlessing}&rdquo;
              </p>
              <div className="border-t border-gold-400/10 pt-4">
                <h4 className="font-serif font-bold text-gold-400 text-base">The Bennett Family</h4>
                <p className="text-xs font-sans text-gold-200/40 uppercase mt-0.5">Parents of the Bride</p>
              </div>
            </motion.div>

            {/* Groom's Family Blessing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-gold-400/20 shadow-md flex flex-col justify-between"
            >
              <p className="text-sm font-sans leading-relaxed text-gold-100/80 italic mb-6">
                &ldquo;{settings.groomFamilyBlessing}&rdquo;
              </p>
              <div className="border-t border-gold-400/10 pt-4">
                <h4 className="font-serif font-bold text-gold-400 text-base">The Carter Family</h4>
                <p className="text-xs font-sans text-gold-200/40 uppercase mt-0.5">Parents of the Groom</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 5: OUR JOURNEY (TIMELINE)
         ========================================== */}
      <section ref={journeyRef} className="py-24 bg-[#0B0B0B]">
        <div className="text-center mb-16 px-6">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Our Love Story</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">Moments that shaped our lives</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>
        
        <Timeline events={initialTimeline} />
      </section>

      {/* ==========================================
          SECTION 6: WEDDING DETAILS & MAPS
         ========================================== */}
      <section ref={detailsRef} className="bg-[#111111]/30 py-24 px-6 border-y border-gold-400/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Wedding Ceremony &amp; Reception</h2>
            <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">Join us as we celebrate</p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Details Cards (Left Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-gold-400/20 shadow-lg flex gap-4 items-start relative overflow-hidden"
              >
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4AF37]" />
                <div className="p-3 bg-gold-950/40 border border-gold-400/20 rounded-2xl text-gold-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white mb-1">Date &amp; Time</h4>
                  <p className="text-sm font-sans text-gold-100/80 font-semibold">
                    {formatWeddingDate(settings.weddingDate)}
                  </p>
                  <p className="text-sm font-sans text-gold-400 font-bold mt-1">
                    Starting at {formatWeddingTime(settings.weddingTime)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-gold-400/20 shadow-lg flex gap-4 items-start relative overflow-hidden"
              >
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4AF37]" />
                <div className="p-3 bg-gold-950/40 border border-gold-400/20 rounded-2xl text-gold-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white mb-1">The Venue</h4>
                  <p className="text-sm font-sans text-white font-bold">
                    {settings.venueName}
                  </p>
                  <p className="text-xs font-sans text-gold-100/70 mt-1 leading-relaxed">
                    {settings.venueAddress}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.venueName + ' ' + settings.venueAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-serif font-bold text-gold-400 hover:text-gold-300 mt-4 transition-colors cursor-pointer"
                  >
                    Open in Google Maps
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Embedded Google Map (Right Columns) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7 h-[350px] lg:h-auto rounded-[35px] overflow-hidden border border-gold-400/20 shadow-lg relative bg-neutral-900"
            >
              <iframe
                title="Wedding Venue Google Maps Location"
                src={settings.venueMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 7: WEDDING DAY PROGRAM
         ========================================== */}
      <section ref={programRef} className="py-24 bg-[#0B0B0B]">
        <div className="text-center mb-16 px-6">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Wedding Day Schedule</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">What to expect on our special day</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        <Program items={initialProgram} />
      </section>

      {/* ==========================================
          SECTION 8: GALLERY
         ========================================== */}
      <section ref={galleryRef} className="bg-[#111111]/30 py-24 border-y border-gold-400/10">
        <div className="text-center mb-16 px-6">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Our Moments</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">Pre-wedding photos and memory highlights</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        <Gallery images={initialGallery} />
      </section>

      {/* ==========================================
          SECTION 9: GUEST WISHES
         ========================================== */}
      <section ref={wishesRef} className="py-24 bg-[#0B0B0B]">
        <div className="text-center mb-16 px-6">
          <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Guest Wishes</h2>
          <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">Leave your blessings &amp; words of support</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        </div>

        <Wishes initialWishes={initialWishes} />
      </section>

      {/* ==========================================
          SECTION 10: GIFT INFORMATION (OPTIONAL)
         ========================================== */}
      {settings.giftEnabled && (
        <section ref={giftRef} className="bg-[#111111]/30 py-24 px-6 border-t border-gold-400/10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="luxury-heading text-3xl md:text-4xl mb-3">Wedding Registry &amp; Gifts</h2>
              <p className="text-sm font-sans tracking-widest text-gold-200/60 uppercase">If you wish to send a gift</p>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card max-w-2xl mx-auto p-8 sm:p-12 rounded-[40px] border border-gold-400/20 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300" />
              
              {/* Gift Message & Info */}
              <div className="flex-1 text-left">
                <Gift className="w-8 h-8 text-gold-400 mb-4" />
                <p className="text-sm font-sans leading-relaxed text-gold-100/70 mb-6">
                  {settings.giftMessage}
                </p>
                <div className="bg-black/50 p-4 rounded-2xl border border-gold-400/20 space-y-2">
                  <div>
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-gold-200/50 uppercase">Bank Name</span>
                    <p className="text-sm font-serif font-bold text-gold-400">{settings.giftBankName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-gold-200/50 uppercase">Account Number</span>
                    <p className="text-base font-sans font-bold text-white tracking-wider">{settings.giftAccountNo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-gold-200/50 uppercase">Account Holder</span>
                    <p className="text-xs font-sans text-gold-200 font-semibold uppercase">{settings.giftAccountName}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {settings.giftQrCodeUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-[#111111] rounded-3xl border border-gold-400/20 shadow-md">
                  <div className="relative w-40 h-40">
                    <Image
                      src={settings.giftQrCodeUrl}
                      alt="Bank Transfer QR Code"
                      fill
                      sizes="160px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] font-sans text-gold-200/40 mt-2 tracking-widest uppercase">Scan to Transfer</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ==========================================
          SECTION 11: FOOTER
         ========================================== */}
      <footer className="bg-[#050505] text-white py-16 px-6 text-center border-t border-gold-400/20">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-display text-3xl font-bold tracking-widest text-gold-400">
            {settings.brideName} &amp; {settings.groomName}
          </h2>
          <p className="text-xs font-serif tracking-widest text-gold-200/50 uppercase">
            September 20, 2026 &bull; San Francisco, CA
          </p>
          <div className="w-12 h-[1px] bg-gold-400/20 mx-auto" />
          
          <div className="flex justify-center gap-6 text-sm font-sans text-gold-200/50">
            <a href="mailto:love@liamandsophia.com" className="hover:text-gold-400 transition-colors">love@liamandsophia.com</a>
            <span>&bull;</span>
            <a href="tel:+14155550199" className="hover:text-gold-400 transition-colors">+1 (415) 555-0199</a>
          </div>

          <p className="text-[10px] font-sans tracking-widest text-gold-200/30 uppercase pt-6">
            &copy; {new Date().getFullYear()} Githmie &amp; Ruwan's Wedding. All Rights Reserved.
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
