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
  Users,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Check,
  X,
  FileText,
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
  Guest,
  GuestAnalytics,
} from '@/lib/types';
import { Toast } from '@/components/admin/Toast';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { DashboardSkeleton } from '@/components/admin/LoadingSkeleton';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { SortableList } from '@/components/admin/SortableList';

const inputClass =
  'w-full px-4 py-2.5 border border-gold-200/40 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100';
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

  const [guests, setGuests] = useState<(Guest & { invitation_visits?: { id: string }[] })[]>([]);
  const [guestAnalytics, setGuestAnalytics] = useState<GuestAnalytics>({
    totalGuests: 0,
    totalLinks: 0,
    invitationsViewed: 0,
    pendingViews: 0,
    totalAttendingGuests: 0,
    totalDeclined: 0,
    pendingRsvps: 0,
  });
  const [newGuest, setNewGuest] = useState({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'attending' | 'declined' | 'pending'>('all');

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
          bride_name: 'Ruwan',
          groom_name: 'Githmie',
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

      // Load guests
      let guestList: any[] = [];
      let analytics: GuestAnalytics = {
        totalGuests: 0,
        totalLinks: 0,
        invitationsViewed: 0,
        pendingViews: 0,
        totalAttendingGuests: 0,
        totalDeclined: 0,
        pendingRsvps: 0,
      };
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem('guests');
        guestList = stored ? JSON.parse(stored) : [];
        let totalAttendingGuests = 0;
        let totalDeclined = 0;
        let pendingRsvps = 0;
        guestList.forEach((g) => {
          if (g.rsvp_status === 'attending') {
            totalAttendingGuests += g.rsvp_guests_count || 0;
          } else if (g.rsvp_status === 'declined') {
            totalDeclined++;
          } else {
            pendingRsvps++;
          }
        });
        analytics = {
          totalGuests: guestList.length,
          totalLinks: guestList.length,
          invitationsViewed: 0,
          pendingViews: guestList.length,
          totalAttendingGuests,
          totalDeclined,
          pendingRsvps,
        };
      } else {
        try {
          guestList = await adminApi.getGuests();
          analytics = await adminApi.getGuestAnalytics();
        } catch (err) {
          console.warn('Failed to load guests from API, using empty list:', err);
        }
      }
      setGuests(guestList);
      setGuestAnalytics(analytics);
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

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.guest_name || !newGuest.whatsapp_number) return;
    setSaveLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const token = Math.random().toString(36).substring(2, 12);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const createdGuest: Guest = {
          id: Math.random().toString(36).substring(2, 9),
          guest_name: newGuest.guest_name.trim(),
          whatsapp_number: newGuest.whatsapp_number.trim(),
          invitation_type: newGuest.invitation_type as any,
          invitation_token: token,
          invitation_link: `${origin}/invitation/${token}`,
          rsvp_status: null,
          rsvp_guests_count: 0,
          rsvp_message: null,
          rsvp_submitted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const currentGuests = [...guests];
        if (currentGuests.some((g) => g.whatsapp_number === createdGuest.whatsapp_number)) {
          showToast('A guest with this WhatsApp number is already registered.', 'error');
          return;
        }
        currentGuests.unshift(createdGuest);
        localStorage.setItem('guests', JSON.stringify(currentGuests));
        setGuests(currentGuests);
        let totalAttendingGuests = 0;
        let totalDeclined = 0;
        let pendingRsvps = 0;
        currentGuests.forEach((g) => {
          if (g.rsvp_status === 'attending') {
            totalAttendingGuests += g.rsvp_guests_count || 0;
          } else if (g.rsvp_status === 'declined') {
            totalDeclined++;
          } else {
            pendingRsvps++;
          }
        });
        setGuestAnalytics((prev) => ({
          ...prev,
          totalGuests: currentGuests.length,
          totalLinks: currentGuests.length,
          pendingViews: currentGuests.length,
          totalAttendingGuests,
          totalDeclined,
          pendingRsvps,
        }));
        setNewGuest({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
        showToast('Guest added successfully', 'success');
      } else {
        const created = await adminApi.createGuest(newGuest);
        setGuests((prev) => [created, ...prev]);
        setNewGuest({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
        showToast('Guest added successfully', 'success');
        const analytics = await adminApi.getGuestAnalytics();
        setGuestAnalytics(analytics);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add guest', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuestId || !newGuest.guest_name || !newGuest.whatsapp_number) return;
    setSaveLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const currentGuests = [...guests];
        const index = currentGuests.findIndex((g) => g.id === editingGuestId);
        if (index === -1) return;

        if (
          currentGuests.some(
            (g, i) => i !== index && g.whatsapp_number === newGuest.whatsapp_number.trim()
          )
        ) {
          showToast('A guest with this WhatsApp number is already registered.', 'error');
          return;
        }

        currentGuests[index] = {
          ...currentGuests[index],
          guest_name: newGuest.guest_name.trim(),
          whatsapp_number: newGuest.whatsapp_number.trim(),
          invitation_type: newGuest.invitation_type as any,
          updated_at: new Date().toISOString(),
        };

        localStorage.setItem('guests', JSON.stringify(currentGuests));
        setGuests(currentGuests);
        setEditingGuestId(null);
        setNewGuest({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
        showToast('Guest updated successfully', 'success');
      } else {
        const updated = await adminApi.updateGuest(editingGuestId, newGuest);
        setGuests((prev) => prev.map((g) => (g.id === editingGuestId ? updated : g)));
        setEditingGuestId(null);
        setNewGuest({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
        showToast('Guest updated successfully', 'success');
        const analytics = await adminApi.getGuestAnalytics();
        setGuestAnalytics(analytics);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update guest', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      if (!isSupabaseConfigured) {
        const currentGuests = guests.filter((g) => g.id !== id);
        localStorage.setItem('guests', JSON.stringify(currentGuests));
        setGuests(currentGuests);
        let totalAttendingGuests = 0;
        let totalDeclined = 0;
        let pendingRsvps = 0;
        currentGuests.forEach((g) => {
          if (g.rsvp_status === 'attending') {
            totalAttendingGuests += g.rsvp_guests_count || 0;
          } else if (g.rsvp_status === 'declined') {
            totalDeclined++;
          } else {
            pendingRsvps++;
          }
        });
        setGuestAnalytics((prev) => ({
          ...prev,
          totalGuests: currentGuests.length,
          totalLinks: currentGuests.length,
          pendingViews: currentGuests.length,
          totalAttendingGuests,
          totalDeclined,
          pendingRsvps,
        }));
        showToast('Guest deleted successfully', 'success');
      } else {
        await adminApi.deleteGuest(id);
        setGuests((prev) => prev.filter((g) => g.id !== id));
        showToast('Guest deleted successfully', 'success');
        const analytics = await adminApi.getGuestAnalytics();
        setGuestAnalytics(analytics);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guest', 'error');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkInput.trim()) return;
    setSaveLoading(true);
    try {
      const lines = bulkInput.split('\n');
      const parsedGuests: { guest_name: string; whatsapp_number: string; invitation_type: string }[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        const guest_name = parts[0]?.trim() || '';
        const whatsapp_number = parts[1]?.trim() || '';
        let invitation_type = parts[2]?.trim().toLowerCase() || 'individual';

        if (!['individual', 'spouse', 'family'].includes(invitation_type)) {
          invitation_type = 'individual';
        }

        if (guest_name && whatsapp_number) {
          parsedGuests.push({ guest_name, whatsapp_number, invitation_type });
        }
      }

      if (parsedGuests.length === 0) {
        showToast('No valid guest data found. Format: Name, WhatsApp, Type', 'error');
        return;
      }

      if (!isSupabaseConfigured) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const currentGuests = [...guests];
        let imported = 0;
        let duplicateInDb = 0;
        let duplicateInPayload = 0;
        const processedNumbers = new Set<string>();

        for (const item of parsedGuests) {
          if (processedNumbers.has(item.whatsapp_number)) {
            duplicateInPayload++;
            continue;
          }
          if (currentGuests.some((g) => g.whatsapp_number === item.whatsapp_number)) {
            duplicateInDb++;
            continue;
          }

          processedNumbers.add(item.whatsapp_number);
          const token = Math.random().toString(36).substring(2, 12);
          currentGuests.unshift({
            id: Math.random().toString(36).substring(2, 9),
            guest_name: item.guest_name,
            whatsapp_number: item.whatsapp_number,
            invitation_type: item.invitation_type as any,
            invitation_token: token,
            invitation_link: `${origin}/invitation/${token}`,
            rsvp_status: null,
            rsvp_guests_count: 0,
            rsvp_message: null,
            rsvp_submitted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          imported++;
        }

        localStorage.setItem('guests', JSON.stringify(currentGuests));
        setGuests(currentGuests);
        let totalAttendingGuests = 0;
        let totalDeclined = 0;
        let pendingRsvps = 0;
        currentGuests.forEach((g) => {
          if (g.rsvp_status === 'attending') {
            totalAttendingGuests += g.rsvp_guests_count || 0;
          } else if (g.rsvp_status === 'declined') {
            totalDeclined++;
          } else {
            pendingRsvps++;
          }
        });
        setGuestAnalytics((prev) => ({
          ...prev,
          totalGuests: currentGuests.length,
          totalLinks: currentGuests.length,
          pendingViews: currentGuests.length,
          totalAttendingGuests,
          totalDeclined,
          pendingRsvps,
        }));

        showToast(
          `Imported ${imported} guests. Skipped ${duplicateInDb + duplicateInPayload} duplicates.`,
          'success'
        );
        setBulkInput('');
        setShowBulkModal(false);
      } else {
        const res = await adminApi.importBulkGuests(parsedGuests);
        showToast(res.message, 'success');
        setBulkInput('');
        setShowBulkModal(false);
        const [list, analytics] = await Promise.all([
          adminApi.getGuests(),
          adminApi.getGuestAnalytics(),
        ]);
        setGuests(list);
        setGuestAnalytics(analytics);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to import guests', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendWhatsApp = (guest: Guest) => {
    const groomName = weddingInfo?.groom_name || 'Githmie';
    const brideName = weddingInfo?.bride_name || 'Ruwan';
    const weddingDate = weddingInfo?.wedding_date || '2026-09-20';
    const venueName = weddingInfo?.venue_name || '';

    // Emoji via pre-encoded UTF-8 bytes — 100% immune to file encoding or compiler issues
    // Each string is the correct UTF-8 bytes of the emoji, percent-encoded as plain ASCII
    const em = (s: string) => decodeURIComponent(s);
    const e_sparkles = em('%E2%9C%A8');                // ✨
    const e_ring     = em('%F0%9F%92%8D');             // 💍
    const e_bride    = em('%F0%9F%91%B0');             // 👰
    const e_groom    = em('%F0%9F%A4%B5');             // 🤵
    const e_calendar = em('%F0%9F%93%85');             // 📅
    const e_pin      = em('%F0%9F%93%8D');             // 📍
    const e_link     = em('%F0%9F%94%97');             // 🔗
    const e_heart    = em('%F0%9F%92%9B');             // 💛
    const e_couple   = em('%F0%9F%92%91');             // 💑
    const e_family   = em('%F0%9F%91%A8%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A6'); // 👨‍👩‍👧‍👦

    let salutation = `Dear ${guest.guest_name}`;
    let guestNote = '';
    if (guest.invitation_type === 'spouse') {
      salutation = `Dear ${guest.guest_name} & Your Beloved Partner`;
      guestNote = `\nThis invitation is extended warmly to both of you. ${e_couple}`;
    } else if (guest.invitation_type === 'family') {
      salutation = `Dear ${guest.guest_name} & Your Wonderful Family`;
      guestNote = `\nWe warmly welcome you and your entire family to share in this joyful occasion. ${e_family}`;
    }

    // Format date nicely
    let formattedDate = weddingDate;
    try {
      formattedDate = new Date(weddingDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch (_) {}

    const lines: string[] = [
      `${e_sparkles} *A Joyful Wedding Invitation* ${e_sparkles}`,
      ``,
      `${salutation},${guestNote}`,
      ``,
      `With hearts full of love and excitement, we cordially invite you to witness and celebrate the beginning of our beautiful journey together as we say *"I Do"*. ${e_ring}`,
      ``,
      `${e_bride}${e_groom} *${brideName} & ${groomName}*`,
      `are getting married!`,
      ``,
      `${e_calendar} *Date:* ${formattedDate}`,
    ];
    if (venueName) lines.push(`${e_pin} *Venue:* ${venueName}`);
    lines.push(
      ``,
      `We have prepared a beautiful personalized wedding invitation just for you. Please open your unique link to view all the details, program, and to RSVP:`,
      ``,
      `${e_link} ${guest.invitation_link}`,
      ``,
      `Your presence would mean the world to us. We truly hope to celebrate this magical day surrounded by the people we cherish most.`,
      ``,
      `With all our love,`,
      `*${brideName} & ${groomName}* ${e_heart}`
    );

    const message = lines.join('\n');

    // Normalize phone number to international format (no + sign, digits only)
    // Local Sri Lankan format 07XXXXXXXX -> 947XXXXXXXX
    let cleanedPhone = guest.whatsapp_number.replace(/[^\d]/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '94' + cleanedPhone.slice(1);
    }

    const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };



  const handleCopyLink = (guest: Guest) => {
    navigator.clipboard.writeText(guest.invitation_link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Link copied to clipboard', 'success');
  };

  const handleCopyAllLinks = () => {
    const text = filteredGuests.map((g) => `${g.guest_name}: ${g.invitation_link}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('All invitation links copied', 'success');
  };

  const handleExportCSV = () => {
    const header = 'Name,WhatsApp,Type,Link,Status\n';
    const rows = filteredGuests
      .map((g) => {
        const hasVisited = g.invitation_visits && g.invitation_visits.length > 0;
        return `"${g.guest_name.replace(/"/g, '""')}","${g.whatsapp_number}","${g.invitation_type}","${g.invitation_link}","${hasVisited ? 'Viewed' : 'Pending'}"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `guests_invitations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded', 'success');
  };

  const filteredGuests = guests.filter(
    (g) => {
      const matchesSearch =
        g.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.whatsapp_number.includes(searchQuery);
      if (!matchesSearch) return false;

      if (rsvpFilter === 'attending') return g.rsvp_status === 'attending';
      if (rsvpFilter === 'declined') return g.rsvp_status === 'declined';
      if (rsvpFilter === 'pending') return !g.rsvp_status;
      return true;
    }
  );


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
    { id: 'guests', label: '📋 Guest Management', icon: <Users className="w-4 h-4" /> },
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

          {activeTab === 'guests' && (
            <div className="space-y-6 animate-fadeIn">
              <PanelHeader title="Guest Invitation Management" subtitle="Manage guests, invitation types, and track RSVP confirmations" showSave={false} />
              
              {/* Analytics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Row 1: RSVPs */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Total Guests</span>
                  <span className="text-2xl font-display font-semibold text-zinc-800 dark:text-zinc-100 mt-2">{guestAnalytics.totalGuests}</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Confirmed Attending</span>
                  <span className="text-2xl font-display font-semibold text-gold-600 dark:text-gold-400 mt-2">
                    {guestAnalytics.totalAttendingGuests || 0}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal ml-1"> head-count</span>
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Invitations Declined</span>
                  <span className="text-2xl font-display font-semibold text-red-500 dark:text-red-400 mt-2">{guestAnalytics.totalDeclined || 0}</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Pending RSVPs</span>
                  <span className="text-2xl font-display font-semibold text-amber-500 dark:text-amber-400 mt-2">{guestAnalytics.pendingRsvps || 0}</span>
                </div>

                {/* Row 2: Link Views */}
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Invitation Links</span>
                  <span className="text-2xl font-display font-semibold text-zinc-800 dark:text-zinc-100 mt-2">{guestAnalytics.totalLinks}</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Links Viewed</span>
                  <span className="text-2xl font-display font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    {guestAnalytics.invitationsViewed} 
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal ml-1.5">
                      ({guestAnalytics.totalGuests > 0 ? Math.round((guestAnalytics.invitationsViewed / guestAnalytics.totalGuests) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gold-200/20 dark:border-zinc-800 shadow-sm flex flex-col justify-between md:col-span-2">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">Pending Link Views</span>
                  <span className="text-2xl font-display font-semibold text-amber-600 dark:text-amber-400 mt-2">{guestAnalytics.pendingViews}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Form to Add / Edit Guest */}
                <div className="lg:col-span-1 p-5 rounded-2xl bg-gold-50/30 dark:bg-zinc-800/30 border border-gold-200/20 dark:border-zinc-800 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-gold-700 dark:text-gold-400">
                    {editingGuestId ? 'Edit Invitation' : 'Create Invitation'}
                  </h4>
                  <form onSubmit={editingGuestId ? handleUpdateGuest : handleAddGuest} className="space-y-4">
                    <Field label="Guest Name">
                      <input
                        placeholder="e.g. Mr. & Mrs. John Smith"
                        className={inputClass}
                        value={newGuest.guest_name}
                        onChange={(e) => setNewGuest({ ...newGuest, guest_name: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="WhatsApp Number">
                      <input
                        placeholder="e.g. +94771234567"
                        className={inputClass}
                        value={newGuest.whatsapp_number}
                        onChange={(e) => setNewGuest({ ...newGuest, whatsapp_number: e.target.value })}
                        required
                      />
                      {newGuest.whatsapp_number && newGuest.whatsapp_number.replace(/[^\d]/g, '').startsWith('0') ? (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-sans">
                          ⚠️ Local format detected — will auto-convert to international (e.g. 0714885764 → +94714885764)
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-sans">
                          Use international format: +94XXXXXXXXX (Sri Lanka) or +1XXXXXXXXXX (USA)
                        </p>
                      )}
                    </Field>

                    <Field label="Invitation Type">
                      <select
                        className={inputClass}
                        value={newGuest.invitation_type}
                        onChange={(e) => setNewGuest({ ...newGuest, invitation_type: e.target.value })}
                      >
                        <option value="individual">Individual Guest</option>
                        <option value="spouse">Guest + Spouse/Partner</option>
                        <option value="family">Guest + Family</option>
                      </select>
                    </Field>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex-1 py-2 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {editingGuestId ? 'Update' : 'Generate Link'}
                      </button>
                      {editingGuestId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGuestId(null);
                            setNewGuest({ guest_name: '', whatsapp_number: '', invitation_type: 'individual' });
                          }}
                          className="py-2 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Main Guest Table & Search */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search guests..."
                        className={`${inputClass} pl-10`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(true)}
                      className="py-2 px-4 rounded-xl border border-gold-200 dark:border-zinc-800 text-gold-600 dark:text-gold-400 bg-gold-50/20 hover:bg-gold-50/50 dark:hover:bg-zinc-800/50 text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                    >
                      Bulk Import (CSV)
                    </button>
                  </div>

                  {/* RSVP Filter buttons */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => setRsvpFilter('all')}
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        rsvpFilter === 'all'
                          ? 'bg-gold-500 border-gold-500 text-white shadow-sm font-bold'
                          : 'border-zinc-200 dark:border-zinc-805 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      All ({guests.length})
                    </button>
                    <button
                      onClick={() => setRsvpFilter('attending')}
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        rsvpFilter === 'attending'
                          ? 'bg-gold-500 border-gold-500 text-white shadow-sm font-bold'
                          : 'border-zinc-200 dark:border-zinc-805 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      Attending ({guests.filter((g) => g.rsvp_status === 'attending').length})
                    </button>
                    <button
                      onClick={() => setRsvpFilter('declined')}
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        rsvpFilter === 'declined'
                          ? 'bg-gold-500 border-gold-500 text-white shadow-sm font-bold'
                          : 'border-zinc-200 dark:border-zinc-805 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      Declined ({guests.filter((g) => g.rsvp_status === 'declined').length})
                    </button>
                    <button
                      onClick={() => setRsvpFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        rsvpFilter === 'pending'
                          ? 'bg-gold-500 border-gold-500 text-white shadow-sm font-bold'
                          : 'border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      Pending RSVP ({guests.filter((g) => !g.rsvp_status).length})
                    </button>
                  </div>

                  {/* Bulk Action Controls */}
                  {guests.length > 0 && (
                    <div className="flex items-center gap-4 pb-2 text-xs font-semibold">
                      <button
                        onClick={handleCopyAllLinks}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-gold-600 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy All Links
                      </button>
                      <span className="text-zinc-300">|</span>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 text-zinc-500 hover:text-gold-600 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                    </div>
                  )}

                  {/* Table */}
                  <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/35">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-[10px] font-sans font-bold tracking-widest uppercase">
                          <th className="p-4">Guest Details</th>
                          <th className="p-4">WhatsApp</th>
                          <th className="p-4 text-center">Link status</th>
                          <th className="p-4 text-center">RSVP</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {filteredGuests.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400 dark:text-zinc-500 italic font-serif">
                              No guests found.
                            </td>
                          </tr>
                        ) : (
                          filteredGuests.map((guest) => {
                            const hasVisited = guest.invitation_visits && guest.invitation_visits.length > 0;
                            return (
                              <tr key={guest.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-900/40 transition-colors group">
                                <td className="p-4">
                                  <div className="font-serif font-bold text-zinc-800 dark:text-zinc-100 text-sm">
                                    {guest.guest_name}
                                  </div>
                                  <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] uppercase font-sans font-bold tracking-wider ${
                                    guest.invitation_type === 'family'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                                      : guest.invitation_type === 'spouse'
                                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40'
                                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                                  }`}>
                                    {guest.invitation_type}
                                  </span>
                                  {guest.rsvp_message && (
                                    <div className="text-[11px] text-[#5A5A5A] dark:text-zinc-400 italic mt-1.5 font-sans border-l-2 border-gold-400/30 pl-2 max-w-[220px] truncate" title={guest.rsvp_message}>
                                      &ldquo;{guest.rsvp_message}&rdquo;
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                                  {guest.whatsapp_number}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wider ${
                                    hasVisited
                                      ? 'bg-green-50/70 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                                      : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400'
                                  }`}>
                                    {hasVisited ? 'Opened' : 'Unopened'}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                    guest.rsvp_status === 'attending'
                                      ? 'bg-gold-50 dark:bg-gold-950/30 text-gold-700 dark:text-gold-400 border border-gold-100 dark:border-gold-900/20 font-bold'
                                      : guest.rsvp_status === 'declined'
                                      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20'
                                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20'
                                  }`}>
                                    {guest.rsvp_status === 'attending'
                                      ? `Attending (${guest.rsvp_guests_count})`
                                      : guest.rsvp_status === 'declined'
                                      ? 'Declined'
                                      : 'Pending'}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                  <button
                                    onClick={() => handleCopyLink(guest)}
                                    title="Copy Invite Link"
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-300 transition-colors inline-flex items-center justify-center cursor-pointer"
                                  >
                                    {copiedId === guest.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleSendWhatsApp(guest)}
                                    title="Send WhatsApp Invitation"
                                    className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-100/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGuestId(guest.id);
                                      setNewGuest({
                                        guest_name: guest.guest_name,
                                        whatsapp_number: guest.whatsapp_number,
                                        invitation_type: guest.invitation_type,
                                      });
                                    }}
                                    title="Edit Guest"
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-blue-600 hover:border-blue-300 transition-colors inline-flex items-center justify-center cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    title="Delete Guest"
                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-950 bg-white dark:bg-zinc-900 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-flex items-center justify-center cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Bulk Import Modal */}
              {showBulkModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
                  <div className="bg-white dark:bg-zinc-900 max-w-2xl w-full rounded-3xl p-6 border border-gold-200/20 dark:border-zinc-800 shadow-2xl flex flex-col space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-zinc-800 dark:text-zinc-100">Bulk Import Guest List</h3>
                        <p className="text-xs text-gray-400">Add multiple invitations using copy-paste CSV/TSV format</p>
                      </div>
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="text-gray-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-gold-50/50 dark:bg-zinc-800/40 p-4 rounded-xl border border-gold-200/20 dark:border-zinc-800 space-y-1.5">
                      <p className="font-semibold text-gold-700 dark:text-gold-400 uppercase tracking-widest text-[9px] mb-1">Instruction Format</p>
                      <p>1. Paste raw data with one guest entry per line.</p>
                      <p>2. Column format: <code className="font-mono bg-white dark:bg-zinc-800 px-1 border border-zinc-200 dark:border-zinc-700 rounded text-gold-600 font-bold">Name, WhatsAppNumber, Type</code></p>
                      <p>3. Accepted types: <code className="font-mono text-zinc-600 dark:text-zinc-300">individual</code>, <code className="font-mono text-zinc-600 dark:text-zinc-300 font-semibold">spouse</code>, <code className="font-mono text-zinc-600 dark:text-zinc-300">family</code> (defaults to individual).</p>
                      <p className="pt-2 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">Example:<br />Mr. John Smith, +94771234567, individual<br />Mr. & Mrs. Silva, +94765432109, spouse<br />The Perera Family, +94711122233, family</p>
                    </div>

                    <textarea
                      placeholder="Paste your lines here..."
                      className={`${inputClass} font-mono text-xs flex-1`}
                      rows={8}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                    />

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="py-2 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkImport}
                        disabled={saveLoading || !bulkInput.trim()}
                        className="py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {saveLoading ? 'Importing...' : 'Start Import'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
