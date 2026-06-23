'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Clock, 
  MapPin, 
  Music, 
  Heart, 
  Gift, 
  LogOut, 
  Save, 
  Trash2, 
  Plus, 
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Home
} from 'lucide-react';

import { isSupabaseConfigured, supabase } from '@/lib/db';
import { 
  getSettings, 
  saveSettings, 
  getTimeline, 
  saveTimeline, 
  getProgram, 
  saveProgram, 
  getGallery, 
  saveGallery, 
  getWishes, 
  deleteWish 
} from '@/lib/db';
import { WeddingSettings, TimelineEvent, ProgramItem, GalleryImage, GuestWish } from '@/lib/types';

// Simple Toast component inside the dashboard
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-6 z-55 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg border text-sm font-sans font-medium transition-all ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'timeline' | 'program' | 'gallery' | 'wishes' | 'gifts'>('settings');
  const [authLoading, setAuthLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Application Data States
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);

  // Editing Sub-states
  const [newTimeline, setNewTimeline] = useState<Omit<TimelineEvent, 'id'>>({ event_date: '', title: '', description: '', image_url: '', sort_order: 0 });
  const [newProgram, setNewProgram] = useState<Omit<ProgramItem, 'id'>>({ event_time: '', title: '', description: '', sort_order: 0 });
  const [newGallery, setNewGallery] = useState<Omit<GalleryImage, 'id'>>({ image_url: '', caption: '', sort_order: 0 });

  useEffect(() => {
    async function checkAuthAndLoad() {
      // 1. Auth check
      let authenticated = false;
      if (isSupabaseConfigured) {
        const { data: { user } } = await supabase!.auth.getUser();
        if (user) authenticated = true;
      } else {
        const mockSession = localStorage.getItem('wedding_mock_admin_session');
        if (mockSession) authenticated = true;
      }

      if (!authenticated) {
        router.push('/admin/login');
        return;
      }

      setAuthLoading(false);

      // 2. Fetch Data
      try {
        const [sets, time, prog, gall, wishList] = await Promise.all([
          getSettings(),
          getTimeline(),
          getProgram(),
          getGallery(),
          getWishes()
        ]);
        setSettings(sets);
        setTimeline(time);
        setProgram(prog);
        setGallery(gall);
        setWishes(wishList);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        showToast("Failed to load database values", "error");
      }
    }

    checkAuthAndLoad();
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    } else {
      localStorage.removeItem('wedding_mock_admin_session');
    }
    router.push('/admin/login');
  };

  // ==========================================
  // Action Handlers
  // ==========================================

  // Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaveLoading(true);
    try {
      await saveSettings(settings);
      showToast("General settings saved successfully!", "success");
    } catch (e) {
      showToast("Error saving settings", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Timeline (Journey)
  const addTimelineEvent = () => {
    if (!newTimeline.title || !newTimeline.event_date) return;
    const tempId = 'new-' + Math.random().toString();
    const eventToAdd: TimelineEvent = {
      id: tempId,
      ...newTimeline,
      sort_order: timeline.length + 1
    };
    setTimeline([...timeline, eventToAdd]);
    setNewTimeline({ event_date: '', title: '', description: '', image_url: '', sort_order: 0 });
  };

  const removeTimelineEvent = (id: string) => {
    setTimeline(timeline.filter(e => e.id !== id));
  };

  const moveTimeline = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === timeline.length - 1) return;
    
    const newItems = [...timeline];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setTimeline(newItems);
  };

  const handleSaveTimeline = async () => {
    setSaveLoading(true);
    try {
      await saveTimeline(timeline);
      showToast("Journey timeline saved successfully!", "success");
    } catch (e) {
      showToast("Error saving timeline changes", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Program
  const addProgramItem = () => {
    if (!newProgram.title || !newProgram.event_time) return;
    const tempId = 'new-' + Math.random().toString();
    const itemToAdd: ProgramItem = {
      id: tempId,
      ...newProgram,
      sort_order: program.length + 1
    };
    setProgram([...program, itemToAdd]);
    setNewProgram({ event_time: '', title: '', description: '', sort_order: 0 });
  };

  const removeProgramItem = (id: string) => {
    setProgram(program.filter(e => e.id !== id));
  };

  const moveProgram = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === program.length - 1) return;

    const newItems = [...program];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setProgram(newItems);
  };

  const handleSaveProgram = async () => {
    setSaveLoading(true);
    try {
      await saveProgram(program);
      showToast("Program schedule saved successfully!", "success");
    } catch (e) {
      showToast("Error saving program details", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Gallery
  const addGalleryImage = () => {
    if (!newGallery.image_url) return;
    const tempId = 'new-' + Math.random().toString();
    const imgToAdd: GalleryImage = {
      id: tempId,
      ...newGallery,
      sort_order: gallery.length + 1
    };
    setGallery([...gallery, imgToAdd]);
    setNewGallery({ image_url: '', caption: '', sort_order: 0 });
  };

  const removeGalleryImage = (id: string) => {
    setGallery(gallery.filter(g => g.id !== id));
  };

  const handleSaveGallery = async () => {
    setSaveLoading(true);
    try {
      await saveGallery(gallery);
      showToast("Gallery photos saved successfully!", "success");
    } catch (e) {
      showToast("Error saving gallery list", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Wishes
  const handleDeleteWish = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest blessing?")) return;
    try {
      await deleteWish(id);
      setWishes(wishes.filter(w => w.id !== id));
      showToast("Wish deleted successfully", "success");
    } catch (e) {
      showToast("Error deleting wish", "error");
    }
  };

  if (authLoading || !settings) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF6F0] text-gold-600 font-serif">
        <Sparkles className="w-10 h-10 animate-spin mb-4" />
        <p className="tracking-widest">Loading Secured Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-gold-200/20 py-4 px-6 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold tracking-widest text-gold-600">
              {settings.brideName[0]} & {settings.groomName[0]} Portal
            </span>
            <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-[10px] uppercase font-bold tracking-widest rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-gray-500 hover:text-gold-600 transition-colors bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200/50 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              View Invitation
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-colors bg-white px-3.5 py-2 rounded-xl border border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-gold-200/10 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'timeline' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            Love Journey
          </button>
          <button
            onClick={() => setActiveTab('program')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'program' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            Wedding Day Program
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'gallery' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Photo Gallery
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer relative ${
              activeTab === 'wishes' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Wishes Moderator
            {wishes.length > 0 && (
              <span className="absolute right-4 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-sans font-bold leading-none">
                {wishes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer ${
              activeTab === 'gifts' 
                ? 'bg-gold-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
            }`}
          >
            <Gift className="w-4 h-4" />
            Gifts & Registry
          </button>
        </aside>

        {/* Dynamic Tab Pane */}
        <section className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-[35px] border border-gold-200/10 shadow-sm relative min-h-[500px]">
          
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">General Details</h2>
                  <p className="text-xs text-gray-400">Configure wedding date, details, and information</p>
                </div>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-serif font-semibold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride Call Name</label>
                  <input
                    type="text"
                    required
                    value={settings.brideName}
                    onChange={(e) => setSettings({ ...settings, brideName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride Full Name</label>
                  <input
                    type="text"
                    required
                    value={settings.brideFullName}
                    onChange={(e) => setSettings({ ...settings, brideFullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride Introduction</label>
                  <textarea
                    rows={2}
                    required
                    value={settings.brideIntro}
                    onChange={(e) => setSettings({ ...settings, brideIntro: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride's Father Name</label>
                  <input
                    type="text"
                    required
                    value={settings.brideFather}
                    onChange={(e) => setSettings({ ...settings, brideFather: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride's Mother Name</label>
                  <input
                    type="text"
                    required
                    value={settings.brideMother}
                    onChange={(e) => setSettings({ ...settings, brideMother: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bride Family Blessing Message</label>
                  <textarea
                    rows={2}
                    required
                    value={settings.brideFamilyBlessing}
                    onChange={(e) => setSettings({ ...settings, brideFamilyBlessing: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm resize-none"
                  />
                </div>

                {/* Groom Info */}
                <div className="border-t border-gray-100 md:col-span-2 pt-6 my-2" />

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom Call Name</label>
                  <input
                    type="text"
                    required
                    value={settings.groomName}
                    onChange={(e) => setSettings({ ...settings, groomName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom Full Name</label>
                  <input
                    type="text"
                    required
                    value={settings.groomFullName}
                    onChange={(e) => setSettings({ ...settings, groomFullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom Introduction</label>
                  <textarea
                    rows={2}
                    required
                    value={settings.groomIntro}
                    onChange={(e) => setSettings({ ...settings, groomIntro: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom's Father Name</label>
                  <input
                    type="text"
                    required
                    value={settings.groomFather}
                    onChange={(e) => setSettings({ ...settings, groomFather: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom's Mother Name</label>
                  <input
                    type="text"
                    required
                    value={settings.groomMother}
                    onChange={(e) => setSettings({ ...settings, groomMother: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Groom Family Blessing Message</label>
                  <textarea
                    rows={2}
                    required
                    value={settings.groomFamilyBlessing}
                    onChange={(e) => setSettings({ ...settings, groomFamilyBlessing: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm resize-none"
                  />
                </div>

                {/* Logistics */}
                <div className="border-t border-gray-100 md:col-span-2 pt-6 my-2" />

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Wedding Date</label>
                  <input
                    type="date"
                    required
                    value={settings.weddingDate}
                    onChange={(e) => setSettings({ ...settings, weddingDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Wedding Start Time</label>
                  <input
                    type="time"
                    required
                    value={settings.weddingTime}
                    onChange={(e) => setSettings({ ...settings, weddingTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Venue Name</label>
                  <input
                    type="text"
                    required
                    value={settings.venueName}
                    onChange={(e) => setSettings({ ...settings, venueName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Google Maps Embed URL</label>
                  <input
                    type="text"
                    required
                    value={settings.venueMapUrl}
                    onChange={(e) => setSettings({ ...settings, venueMapUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Venue Address</label>
                  <input
                    type="text"
                    required
                    value={settings.venueAddress}
                    onChange={(e) => setSettings({ ...settings, venueAddress: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Background Music Track URL (MP3)</label>
                  <input
                    type="text"
                    required
                    value={settings.musicUrl}
                    onChange={(e) => setSettings({ ...settings, musicUrl: e.target.value })}
                    placeholder="https://example.com/song.mp3"
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: LOVE JOURNEY */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">Love Story Journey</h2>
                  <p className="text-xs text-gray-400">Add, edit, or reorder relationship milestones</p>
                </div>
                <button
                  onClick={handleSaveTimeline}
                  disabled={saveLoading}
                  className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-serif font-semibold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Add New Event Block */}
              <div className="p-5 rounded-2xl bg-gold-50/50 border border-gold-200/25 space-y-4">
                <h4 className="font-serif font-bold text-sm text-gold-700">Add New Milestone</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Date Tag (e.g., June 2021)"
                      value={newTimeline.event_date}
                      onChange={(e) => setNewTimeline({ ...newTimeline, event_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Milestone Title (e.g., First Met)"
                      value={newTimeline.title}
                      onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Image URL (e.g. https://unsplash.com/...)"
                      value={newTimeline.image_url}
                      onChange={(e) => setNewTimeline({ ...newTimeline, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      rows={2}
                      placeholder="Event Description..."
                      value={newTimeline.description}
                      onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={addTimelineEvent}
                  className="flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-serif font-semibold tracking-wide cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </button>
              </div>

              {/* Event Table/List */}
              <div className="space-y-3">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-150 items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gold-100 text-gold-800 text-[10px] font-bold rounded-md">{event.event_date}</span>
                        <h5 className="font-serif font-bold text-sm text-[#2D2D2D]">{event.title}</h5>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-lg">{event.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sort arrows */}
                      <button onClick={() => moveTimeline(idx, 'up')} className="p-1.5 hover:bg-gold-100 rounded-lg text-gray-400 hover:text-gold-600 cursor-pointer">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveTimeline(idx, 'down')} className="p-1.5 hover:bg-gold-100 rounded-lg text-gray-400 hover:text-gold-600 cursor-pointer">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      
                      {/* Delete */}
                      <button 
                        onClick={() => removeTimelineEvent(event.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAM */}
          {activeTab === 'program' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">Wedding Program Schedule</h2>
                  <p className="text-xs text-gray-400">Add, edit, or arrange scheduled events on the big day</p>
                </div>
                <button
                  onClick={handleSaveProgram}
                  disabled={saveLoading}
                  className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-serif font-semibold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Add New Program Block */}
              <div className="p-5 rounded-2xl bg-gold-50/50 border border-gold-200/25 space-y-4">
                <h4 className="font-serif font-bold text-sm text-gold-700">Add Schedule Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Event Time (e.g., 16:00 or 4:00 PM)"
                      value={newProgram.event_time}
                      onChange={(e) => setNewProgram({ ...newProgram, event_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Event Name (e.g., Vow Exchange)"
                      value={newProgram.title}
                      onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Item Description (optional)..."
                      value={newProgram.description || ''}
                      onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={addProgramItem}
                  className="flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-serif font-semibold tracking-wide cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              {/* Program list */}
              <div className="space-y-3">
                {program.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-150 items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-gold-100 text-rose-gold-800 text-[10px] font-bold rounded-md">{item.event_time}</span>
                        <h5 className="font-serif font-bold text-sm text-[#2D2D2D]">{item.title}</h5>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate max-w-lg">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => moveProgram(idx, 'up')} className="p-1.5 hover:bg-gold-100 rounded-lg text-gray-400 hover:text-gold-600 cursor-pointer">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveProgram(idx, 'down')} className="p-1.5 hover:bg-gold-100 rounded-lg text-gray-400 hover:text-gold-600 cursor-pointer">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeProgramItem(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">Photo Gallery Manager</h2>
                  <p className="text-xs text-gray-400">Add or manage pre-wedding photos shown in the gallery</p>
                </div>
                <button
                  onClick={handleSaveGallery}
                  disabled={saveLoading}
                  className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-serif font-semibold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Gallery'}
                </button>
              </div>

              {/* Add New Image */}
              <div className="p-5 rounded-2xl bg-gold-50/50 border border-gold-200/25 space-y-4">
                <h4 className="font-serif font-bold text-sm text-gold-700">Add Photo Link</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Image Direct URL (e.g. https://images.unsplash.com/...)"
                      value={newGallery.image_url}
                      onChange={(e) => setNewGallery({ ...newGallery, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Image Caption (optional)..."
                      value={newGallery.caption || ''}
                      onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                      className="w-full px-4 py-2 border border-gold-200/20 rounded-xl text-sm bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={addGalleryImage}
                  className="flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-serif font-semibold tracking-wide cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Photo
                </button>
              </div>

              {/* Photos list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50 flex flex-col justify-between relative group">
                    <div className="aspect-[4/3] w-full relative bg-gray-200">
                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex justify-between items-center gap-2">
                      <span className="text-[10px] font-sans text-gray-500 truncate">{img.caption || 'No caption'}</span>
                      <button 
                        onClick={() => removeGalleryImage(img.id)}
                        className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WISHES MODERATOR */}
          {activeTab === 'wishes' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">Guest Wishes Moderation</h2>
                <p className="text-xs text-gray-400">View and remove blessings submitted by guests to prevent spam</p>
              </div>

              <div className="space-y-4">
                {wishes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-serif italic">
                    No wishes submitted yet.
                  </div>
                ) : (
                  wishes.map((wish) => (
                    <div key={wish.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif font-bold text-sm text-[#2D2D2D]">{wish.name}</h5>
                          <span className="text-[10px] text-gray-400">{new Date(wish.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-[#5A5A5A] italic leading-relaxed">&ldquo;{wish.message}&rdquo;</p>
                      </div>

                      <button
                        onClick={() => handleDeleteWish(wish.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl cursor-pointer transition-colors"
                        title="Delete Blessing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REGISTRY & GIFTS */}
          {activeTab === 'gifts' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#2D2D2D]">Gifts Config</h2>
                  <p className="text-xs text-gray-400">Manage the gift registry, bank accounts, and QR Code</p>
                </div>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-serif font-semibold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              {/* Gift Toggle Button */}
              <div className="flex items-center gap-3 p-4 bg-gold-50/50 border border-gold-200/25 rounded-2xl">
                <input
                  type="checkbox"
                  id="gift-toggle"
                  checked={settings.giftEnabled}
                  onChange={(e) => setSettings({ ...settings, giftEnabled: e.target.checked })}
                  className="w-4.5 h-4.5 rounded border-gold-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                />
                <label htmlFor="gift-toggle" className="font-serif font-semibold text-sm text-gold-800 cursor-pointer select-none">
                  Enable Gift Section on Invitation Website
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Registry Custom Message</label>
                  <textarea
                    rows={3}
                    required
                    value={settings.giftMessage}
                    onChange={(e) => setSettings({ ...settings, giftMessage: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={settings.giftBankName}
                    onChange={(e) => setSettings({ ...settings, giftBankName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required
                    value={settings.giftAccountNo}
                    onChange={(e) => setSettings({ ...settings, giftAccountNo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={settings.giftAccountName}
                    onChange={(e) => setSettings({ ...settings, giftAccountName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] uppercase mb-1.5">QR Code Image Link</label>
                  <input
                    type="text"
                    required
                    value={settings.giftQrCodeUrl}
                    onChange={(e) => setSettings({ ...settings, giftQrCodeUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gold-200/40 rounded-xl bg-gray-50 focus:bg-white focus:outline-none text-sm"
                  />
                </div>
              </div>
            </form>
          )}

        </section>
      </main>

      {/* Floating Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
