'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Clock,
  Music,
  Heart,
  Gift,
  LogOut,
  Save,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Home,
} from 'lucide-react';

import { isSupabaseConfigured, createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { adminApi } from '@/lib/admin/api';
import {
  WeddingInfoRow,
  BrideGroomRow,
  FamilyRow,
  TimelineEventRow,
  WeddingProgramRow,
  GalleryImageRow,
  GuestWish,
  MusicSettingsRow,
  GiftInfoRow,
  AdminTab,
} from '@/lib/types';
import { Toast } from '@/components/admin/Toast';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { DashboardSkeleton } from '@/components/admin/LoadingSkeleton';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { SortableList } from '@/components/admin/SortableList';

const inputClass =
  'w-full px-4 py-2.5 border border-gold-200/40 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none text-sm dark:text-zinc-100';
const labelClass =
  'block text-[10px] font-sans font-bold tracking-widest text-[#5A5A5A] dark:text-zinc-400 uppercase mb-1.5';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('settings');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [weddingInfo, setWeddingInfo] = useState<WeddingInfoRow | null>(null);
  const [brideGroom, setBrideGroom] = useState<BrideGroomRow[]>([]);
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineEventRow[]>([]);
  const [program, setProgram] = useState<WeddingProgramRow[]>([]);
  const [gallery, setGallery] = useState<GalleryImageRow[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [music, setMusic] = useState<MusicSettingsRow | null>(null);
  const [gift, setGift] = useState<GiftInfoRow | null>(null);

  const [newTimeline, setNewTimeline] = useState({ title: '', date: '', description: '', image_url: '' });
  const [newProgram, setNewProgram] = useState({ time: '', event_title: '', description: '' });
  const [newGallery, setNewGallery] = useState({ image_url: '', caption: '' });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [info, bg, fam, time, prog, gall, wishList, mus, gft] = await Promise.all([
        adminApi.getWeddingInfo(),
        adminApi.getBrideGroom(),
        adminApi.getFamilies(),
        adminApi.getTimeline(),
        adminApi.getProgram(),
        adminApi.getGallery(),
        adminApi.getWishes(),
        adminApi.getMusic(),
        adminApi.getGift(),
      ]);
      setWeddingInfo(
        (info as WeddingInfoRow) ?? {
          id: '',
          bride_name: 'Sophia',
          groom_name: 'Liam',
          wedding_date: '2026-09-20',
          wedding_time: '16:00',
          venue_name: '',
          venue_address: '',
          google_map_link: '',
          invitation_message: '',
          created_at: new Date().toISOString(),
        }
      );
      setBrideGroom(bg as BrideGroomRow[]);
      setFamilies(fam as FamilyRow[]);
      setTimeline(time as TimelineEventRow[]);
      setProgram(prog as WeddingProgramRow[]);
      setGallery(gall as GalleryImageRow[]);
      setWishes(wishList as GuestWish[]);
      setMusic(
        (mus as MusicSettingsRow) ?? {
          id: '',
          track_url: '',
          volume: 0.5,
          is_enabled: true,
        }
      );
      setGift(
        (gft as GiftInfoRow) ?? {
          id: '',
          gift_message: '',
          bank_details: { bank_name: '', account_no: '', account_name: '' },
          qr_code_url: '',
          is_enabled: true,
        }
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard data', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    async function init() {
      if (isSupabaseConfigured) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
      } else {
        const mockSession = localStorage.getItem('wedding_mock_admin_session');
        if (!mockSession) {
          router.push('/login');
          return;
        }
      }
      await loadData();
      setLoading(false);
    }
    init();
  }, [router, loadData]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('wedding_mock_admin_session');
    }
    router.push('/login');
  };

  const getPerson = (type: 'bride' | 'groom') => brideGroom.find((p) => p.type === type);
  const getFamily = (side: 'bride' | 'groom') => families.find((f) => f.side === side);

  const updatePerson = (type: 'bride' | 'groom', field: keyof BrideGroomRow, value: string) => {
    setBrideGroom((prev) => {
      const existing = prev.find((p) => p.type === type);
      if (existing) {
        return prev.map((p) => (p.type === type ? { ...p, [field]: value } : p));
      }
      return [
        ...prev,
        {
          id: '',
          type,
          full_name: '',
          photo_url: null,
          intro: '',
          father_name: '',
          mother_name: '',
          [field]: value,
        } as BrideGroomRow,
      ];
    });
  };

  const updateFamily = (side: 'bride' | 'groom', field: keyof FamilyRow, value: string) => {
    setFamilies((prev) => {
      const existing = prev.find((f) => f.side === side);
      if (existing) {
        return prev.map((f) => (f.side === side ? { ...f, [field]: value } : f));
      }
      return [
        ...prev,
        { id: '', side, parents_names: '', blessing_message: '', [field]: value } as FamilyRow,
      ];
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingInfo) return;
    setSaveLoading(true);
    try {
      await adminApi.patchWeddingInfo({
        bride_name: weddingInfo.bride_name,
        groom_name: weddingInfo.groom_name,
        wedding_date: weddingInfo.wedding_date,
        wedding_time: weddingInfo.wedding_time,
        venue_name: weddingInfo.venue_name,
        venue_address: weddingInfo.venue_address,
        google_map_link: weddingInfo.google_map_link,
        invitation_message: weddingInfo.invitation_message,
      });

      const bride = getPerson('bride');
      const groom = getPerson('groom');
      if (bride) await adminApi.putBrideGroom(bride);
      if (groom) await adminApi.putBrideGroom(groom);

      const brideFam = getFamily('bride');
      const groomFam = getFamily('groom');
      if (brideFam) await adminApi.putFamily(brideFam);
      if (groomFam) await adminApi.putFamily(groomFam);

      showToast('Settings saved successfully!', 'success');
      await loadData();
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddTimeline = async () => {
    if (!newTimeline.title || !newTimeline.date) return;
    setSaveLoading(true);
    try {
      await adminApi.createTimeline(newTimeline);
      setNewTimeline({ title: '', date: '', description: '', image_url: '' });
      await loadData();
      showToast('Timeline event added', 'success');
    } catch {
      showToast('Failed to add timeline event', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReorderTimeline = async (ids: string[]) => {
    try {
      await adminApi.reorderTimeline(ids);
      await loadData();
    } catch {
      showToast('Failed to reorder timeline', 'error');
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    try {
      await adminApi.deleteTimeline(id);
      setTimeline((prev) => prev.filter((t) => t.id !== id));
      showToast('Event deleted', 'success');
    } catch {
      showToast('Failed to delete event', 'error');
    }
  };

  const handleAddProgram = async () => {
    if (!newProgram.event_title || !newProgram.time) return;
    setSaveLoading(true);
    try {
      await adminApi.createProgram(newProgram);
      setNewProgram({ time: '', event_title: '', description: '' });
      await loadData();
      showToast('Program item added', 'success');
    } catch {
      showToast('Failed to add program item', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReorderProgram = async (ids: string[]) => {
    try {
      await adminApi.reorderProgram(ids);
      await loadData();
    } catch {
      showToast('Failed to reorder program', 'error');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await adminApi.deleteProgram(id);
      setProgram((prev) => prev.filter((p) => p.id !== id));
      showToast('Program item deleted', 'success');
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleAddGallery = async () => {
    if (!newGallery.image_url) return;
    setSaveLoading(true);
    try {
      await adminApi.createGallery(newGallery);
      setNewGallery({ image_url: '', caption: '' });
      await loadData();
      showToast('Photo added to gallery', 'success');
    } catch {
      showToast('Failed to add photo', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReorderGallery = async (ids: string[]) => {
    try {
      await adminApi.reorderGallery(ids);
      await loadData();
    } catch {
      showToast('Failed to reorder gallery', 'error');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await adminApi.deleteGallery(id);
      setGallery((prev) => prev.filter((g) => g.id !== id));
      showToast('Photo removed', 'success');
    } catch {
      showToast('Failed to remove photo', 'error');
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Delete this guest wish?')) return;
    try {
      await adminApi.deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
      showToast('Wish deleted', 'success');
    } catch {
      showToast('Failed to delete wish', 'error');
    }
  };

  const handleSaveMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!music) return;
    setSaveLoading(true);
    try {
      await adminApi.patchMusic(music);
      showToast('Music settings saved', 'success');
    } catch {
      showToast('Failed to save music settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gift) return;
    setSaveLoading(true);
    try {
      await adminApi.patchGift(gift);
      showToast('Gift settings saved', 'success');
    } catch {
      showToast('Failed to save gift settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!weddingInfo) {
    return <DashboardSkeleton />;
  }

  const bride = getPerson('bride');
  const groom = getPerson('groom');
  const brideFam = getFamily('bride');
  const groomFam = getFamily('groom');

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'settings', label: 'General Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'timeline', label: 'Love Journey', icon: <Heart className="w-4 h-4" /> },
    { id: 'program', label: 'Wedding Program', icon: <Clock className="w-4 h-4" /> },
    { id: 'gallery', label: 'Photo Gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'wishes', label: 'Wishes Moderator', icon: <MessageSquare className="w-4 h-4" />, badge: wishes.length },
    { id: 'music', label: 'Music', icon: <Music className="w-4 h-4" /> },
    { id: 'gifts', label: 'Gifts & Registry', icon: <Gift className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-zinc-950 flex flex-col font-sans transition-colors">
      <header className="bg-white dark:bg-zinc-900 border-b border-gold-200/20 dark:border-zinc-800 py-4 px-6 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <span className="font-display text-xl font-bold tracking-widest text-gold-600 dark:text-gold-400">
              {weddingInfo.bride_name[0]} & {weddingInfo.groom_name[0]} Portal
            </span>
            <span className="px-2 py-0.5 bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 text-[10px] uppercase font-bold tracking-widest rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-gray-500 dark:text-zinc-400 hover:text-gold-600 transition-colors bg-gray-50 dark:bg-zinc-800 px-3.5 py-2 rounded-xl border border-gray-200/50 dark:border-zinc-700 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              View Invitation
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gold-200/10 dark:border-zinc-800 shadow-sm space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-sm font-semibold tracking-wider transition-all text-left cursor-pointer relative ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gold-50 dark:hover:bg-zinc-800 hover:text-gold-600'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute right-4 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        <section className="lg:col-span-9 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[35px] border border-gold-200/10 dark:border-zinc-800 shadow-sm relative min-h-[500px]">
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <PanelHeader
                title="General Details"
                subtitle="Wedding info, bride & groom profiles, and family blessings"
                saveLoading={saveLoading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Bride Call Name">
                  <input
                    className={inputClass}
                    value={weddingInfo.bride_name}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, bride_name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Groom Call Name">
                  <input
                    className={inputClass}
                    value={weddingInfo.groom_name}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, groom_name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Bride Full Name">
                  <input
                    className={inputClass}
                    value={bride?.full_name ?? ''}
                    onChange={(e) => updatePerson('bride', 'full_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Groom Full Name">
                  <input
                    className={inputClass}
                    value={groom?.full_name ?? ''}
                    onChange={(e) => updatePerson('groom', 'full_name', e.target.value)}
                    required
                  />
                </Field>
                <div className="md:col-span-2">
                  <ImageUpload
                    bucket="bride-groom-images"
                    label="Bride Photo"
                    value={bride?.photo_url ?? ''}
                    onChange={(url) => updatePerson('bride', 'photo_url', url)}
                  />
                </div>
                <Field label="Bride Introduction" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={bride?.intro ?? ''}
                    onChange={(e) => updatePerson('bride', 'intro', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Groom Introduction" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={groom?.intro ?? ''}
                    onChange={(e) => updatePerson('groom', 'intro', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Bride's Father">
                  <input
                    className={inputClass}
                    value={bride?.father_name ?? ''}
                    onChange={(e) => updatePerson('bride', 'father_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Bride's Mother">
                  <input
                    className={inputClass}
                    value={bride?.mother_name ?? ''}
                    onChange={(e) => updatePerson('bride', 'mother_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Groom's Father">
                  <input
                    className={inputClass}
                    value={groom?.father_name ?? ''}
                    onChange={(e) => updatePerson('groom', 'father_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Groom's Mother">
                  <input
                    className={inputClass}
                    value={groom?.mother_name ?? ''}
                    onChange={(e) => updatePerson('groom', 'mother_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Bride Family Blessing" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={brideFam?.blessing_message ?? ''}
                    onChange={(e) => updateFamily('bride', 'blessing_message', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Groom Family Blessing" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={groomFam?.blessing_message ?? ''}
                    onChange={(e) => updateFamily('groom', 'blessing_message', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Wedding Date">
                  <input
                    type="date"
                    className={inputClass}
                    value={weddingInfo.wedding_date}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, wedding_date: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Wedding Time">
                  <input
                    type="time"
                    className={inputClass}
                    value={weddingInfo.wedding_time}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, wedding_time: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Venue Name">
                  <input
                    className={inputClass}
                    value={weddingInfo.venue_name}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, venue_name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Google Maps Embed URL">
                  <input
                    className={inputClass}
                    value={weddingInfo.google_map_link}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, google_map_link: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Venue Address" className="md:col-span-2">
                  <input
                    className={inputClass}
                    value={weddingInfo.venue_address}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, venue_address: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Invitation Message" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={weddingInfo.invitation_message ?? ''}
                    onChange={(e) => setWeddingInfo({ ...weddingInfo, invitation_message: e.target.value })}
                  />
                </Field>
              </div>
            </form>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <PanelHeader title="Love Story Journey" subtitle="Drag to reorder milestones" />
              <AddBlock title="Add Milestone">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Date (e.g. June 2021)"
                    className={inputClass}
                    value={newTimeline.date}
                    onChange={(e) => setNewTimeline({ ...newTimeline, date: e.target.value })}
                  />
                  <input
                    placeholder="Title"
                    className={inputClass}
                    value={newTimeline.title}
                    onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <ImageUpload
                      bucket="timeline-images"
                      label="Event Image"
                      value={newTimeline.image_url}
                      onChange={(url) => setNewTimeline({ ...newTimeline, image_url: url })}
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    className={`${inputClass} md:col-span-2 resize-none`}
                    rows={2}
                    value={newTimeline.description}
                    onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTimeline}
                  disabled={saveLoading}
                  className="mt-4 flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </button>
              </AddBlock>
              <SortableList
                items={timeline.map((t) => ({
                  id: t.id,
                  title: t.title,
                  subtitle: `${t.date} — ${t.description}`,
                }))}
                onReorder={handleReorderTimeline}
                onDelete={handleDeleteTimeline}
              />
            </div>
          )}

          {activeTab === 'program' && (
            <div className="space-y-6">
              <PanelHeader title="Wedding Program" subtitle="Drag to reorder schedule items" />
              <AddBlock title="Add Schedule Item">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Time (e.g. 16:00)"
                    className={inputClass}
                    value={newProgram.time}
                    onChange={(e) => setNewProgram({ ...newProgram, time: e.target.value })}
                  />
                  <input
                    placeholder="Event title"
                    className={inputClass}
                    value={newProgram.event_title}
                    onChange={(e) => setNewProgram({ ...newProgram, event_title: e.target.value })}
                  />
                  <input
                    placeholder="Description (optional)"
                    className={`${inputClass} md:col-span-2`}
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProgram}
                  disabled={saveLoading}
                  className="mt-4 flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </AddBlock>
              <SortableList
                items={program.map((p) => ({
                  id: p.id,
                  title: p.event_title,
                  subtitle: `${p.time}${p.description ? ` — ${p.description}` : ''}`,
                }))}
                onReorder={handleReorderProgram}
                onDelete={handleDeleteProgram}
              />
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <PanelHeader title="Photo Gallery" subtitle="Upload images or paste URLs" />
              <AddBlock title="Add Photo">
                <ImageUpload
                  bucket="gallery-images"
                  label="Gallery Photo"
                  value={newGallery.image_url}
                  onChange={(url) => setNewGallery({ ...newGallery, image_url: url })}
                />
                <input
                  placeholder="Caption (optional)"
                  className={`${inputClass} mt-4`}
                  value={newGallery.caption}
                  onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleAddGallery}
                  disabled={saveLoading || !newGallery.image_url}
                  className="mt-4 flex items-center gap-1.5 py-2 px-4 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Photo
                </button>
              </AddBlock>
              <SortableList
                items={gallery.map((g) => ({
                  id: g.id,
                  title: g.caption || 'Untitled photo',
                  subtitle: g.image_url,
                }))}
                onReorder={handleReorderGallery}
                onDelete={handleDeleteGallery}
              />
            </div>
          )}

          {activeTab === 'wishes' && (
            <div className="space-y-6">
              <PanelHeader title="Guest Wishes" subtitle="Moderate submitted blessings" showSave={false} />
              {wishes.length === 0 ? (
                <EmptyState message="No wishes submitted yet." />
              ) : (
                wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-150 dark:border-zinc-700 flex justify-between gap-4"
                  >
                    <div>
                      <h5 className="font-serif font-bold text-sm dark:text-zinc-100">{wish.name}</h5>
                      <p className="text-xs text-gray-400">{new Date(wish.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-[#5A5A5A] dark:text-zinc-300 italic mt-1">&ldquo;{wish.message}&rdquo;</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWish(wish.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1 rounded-lg text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'music' && music && (
            <form onSubmit={handleSaveMusic} className="space-y-6">
              <PanelHeader title="Background Music" subtitle="Upload or link an MP3 track" saveLoading={saveLoading} />
              <label className="flex items-center gap-3 p-4 bg-gold-50/50 dark:bg-zinc-800 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={music.is_enabled}
                  onChange={(e) => setMusic({ ...music, is_enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-serif font-semibold dark:text-zinc-200">Enable background music</span>
              </label>
              <ImageUpload
                bucket="music-tracks"
                label="Music Track (MP3)"
                accept="audio/*"
                value={music.track_url}
                onChange={(url) => setMusic({ ...music, track_url: url })}
              />
              <Field label={`Volume (${Math.round((music.volume ?? 0.5) * 100)}%)`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={music.volume ?? 0.5}
                  onChange={(e) => setMusic({ ...music, volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </Field>
              <Field label="Or paste track URL">
                <input
                  className={inputClass}
                  value={music.track_url}
                  onChange={(e) => setMusic({ ...music, track_url: e.target.value })}
                />
              </Field>
            </form>
          )}

          {activeTab === 'gifts' && gift && (
            <form onSubmit={handleSaveGift} className="space-y-6">
              <PanelHeader title="Gifts & Registry" subtitle="Bank details and QR code" saveLoading={saveLoading} />
              <label className="flex items-center gap-3 p-4 bg-gold-50/50 dark:bg-zinc-800 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={gift.is_enabled}
                  onChange={(e) => setGift({ ...gift, is_enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-serif font-semibold dark:text-zinc-200">Show gift section on invitation</span>
              </label>
              <Field label="Gift Message" className="md:col-span-2">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={gift.gift_message}
                  onChange={(e) => setGift({ ...gift, gift_message: e.target.value })}
                  required
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Bank Name">
                  <input
                    className={inputClass}
                    value={gift.bank_details?.bank_name ?? ''}
                    onChange={(e) =>
                      setGift({
                        ...gift,
                        bank_details: { ...gift.bank_details, bank_name: e.target.value },
                      })
                    }
                    required
                  />
                </Field>
                <Field label="Account Number">
                  <input
                    className={inputClass}
                    value={gift.bank_details?.account_no ?? ''}
                    onChange={(e) =>
                      setGift({
                        ...gift,
                        bank_details: { ...gift.bank_details, account_no: e.target.value },
                      })
                    }
                    required
                  />
                </Field>
                <Field label="Account Holder">
                  <input
                    className={inputClass}
                    value={gift.bank_details?.account_name ?? ''}
                    onChange={(e) =>
                      setGift({
                        ...gift,
                        bank_details: { ...gift.bank_details, account_name: e.target.value },
                      })
                    }
                    required
                  />
                </Field>
              </div>
              <ImageUpload
                bucket="qr-codes"
                label="QR Code Image"
                value={gift.qr_code_url ?? ''}
                onChange={(url) => setGift({ ...gift, qr_code_url: url })}
              />
            </form>
          )}
        </section>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
  saveLoading,
  showSave = true,
}: {
  title: string;
  subtitle: string;
  saveLoading?: boolean;
  showSave?: boolean;
}) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
      <div>
        <h2 className="font-serif font-bold text-xl text-[#2D2D2D] dark:text-zinc-100">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      {showSave && (
        <button
          type="submit"
          disabled={saveLoading}
          className="flex items-center gap-2 py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold tracking-widest uppercase cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saveLoading ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function AddBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-gold-50/50 dark:bg-zinc-800/50 border border-gold-200/25 dark:border-zinc-700">
      <h4 className="font-serif font-bold text-sm text-gold-700 dark:text-gold-400 mb-4">{title}</h4>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 text-gray-400 font-serif italic">
      {message}
    </div>
  );
}
