import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseServer';
import {
  WeddingSettings,
  TimelineEvent,
  ProgramItem,
  GalleryImage,
  GuestWish,
  BrideGroomRow,
  FamilyRow,
  GiftInfoRow,
  MusicSettingsRow,
} from './types';

export { isSupabaseConfigured };

function getReadClient() {
  if (isSupabaseAdminConfigured && supabaseAdmin) return supabaseAdmin;
  return supabase;
}

const DEFAULT_SETTINGS: WeddingSettings = {
  brideName: 'Ruwan',
  brideFullName: 'Ruwan Evelyn Bennett',
  brideIntro: 'A software developer who loves painting and hiking.',
  brideFather: 'Charles Bennett',
  brideMother: 'Helena Bennett',
  brideFamilyBlessing: 'We are overjoyed to welcome Githmie into our family.',
  groomName: 'Githmie',
  groomFullName: 'Githmie Alexander Carter',
  groomIntro: 'An architect who finds harmony in designs and nature.',
  groomFather: 'Arthur Carter',
  groomMother: 'Beatrice Carter',
  groomFamilyBlessing: 'Ruwan has brought so much light into Githmie\'s life.',
  weddingDate: '2026-09-20',
  weddingTime: '16:00',
  venueName: 'The Grand Conservatory & Botanical Gardens',
  venueAddress: '1000 Conservatory Dr, San Francisco, CA 94118',
  venueMapUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2847970725514!2d-122.46231268468222!3d37.77284697975971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085876dbbfa136d%3A0xc07c744f4773489!2sConservatory%20of%20Flowers!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus',
  giftMessage: 'Your presence at our wedding is the greatest gift of all.',
  giftBankName: 'Royal Gold Bank',
  giftAccountNo: '123-4567-890',
  giftAccountName: 'Githmie & Ruwan Joint Account',
  giftQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=wedding-gift',
  giftEnabled: true,
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

const DEFAULT_TIMELINE: TimelineEvent[] = [
  {
    id: 't1',
    event_date: 'June 2021',
    title: 'First Meeting',
    description: 'We crossed paths at a local coffee shop.',
    image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    sort_order: 1,
  },
];

const DEFAULT_PROGRAM: ProgramItem[] = [
  { id: 'p1', event_time: '16:00', title: 'Wedding Ceremony', description: 'Vows exchange.', sort_order: 1 },
];

const DEFAULT_GALLERY: GalleryImage[] = [
  {
    id: 'g1',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    caption: 'Our Engagement Ring',
    sort_order: 1,
  },
];

const DEFAULT_WISHES: GuestWish[] = [];

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

function assembleSettings(
  weddingInfo: Record<string, unknown> | null,
  brideGroom: BrideGroomRow[],
  families: FamilyRow[],
  gift: GiftInfoRow | null,
  music: MusicSettingsRow | null
): WeddingSettings {
  const bride = brideGroom.find((r) => r.type === 'bride');
  const groom = brideGroom.find((r) => r.type === 'groom');
  const brideFamily = families.find((f) => f.side === 'bride');
  const groomFamily = families.find((f) => f.side === 'groom');

  return {
    brideName: (weddingInfo?.bride_name as string) ?? bride?.full_name?.split(' ')[0] ?? DEFAULT_SETTINGS.brideName,
    brideFullName: bride?.full_name ?? DEFAULT_SETTINGS.brideFullName,
    brideIntro: bride?.intro ?? DEFAULT_SETTINGS.brideIntro,
    brideFather: bride?.father_name ?? DEFAULT_SETTINGS.brideFather,
    brideMother: bride?.mother_name ?? DEFAULT_SETTINGS.brideMother,
    brideFamilyBlessing: brideFamily?.blessing_message ?? DEFAULT_SETTINGS.brideFamilyBlessing,
    groomName: (weddingInfo?.groom_name as string) ?? groom?.full_name?.split(' ')[0] ?? DEFAULT_SETTINGS.groomName,
    groomFullName: groom?.full_name ?? DEFAULT_SETTINGS.groomFullName,
    groomIntro: groom?.intro ?? DEFAULT_SETTINGS.groomIntro,
    groomFather: groom?.father_name ?? DEFAULT_SETTINGS.groomFather,
    groomMother: groom?.mother_name ?? DEFAULT_SETTINGS.groomMother,
    groomFamilyBlessing: groomFamily?.blessing_message ?? DEFAULT_SETTINGS.groomFamilyBlessing,
    weddingDate: (weddingInfo?.wedding_date as string) ?? DEFAULT_SETTINGS.weddingDate,
    weddingTime: (weddingInfo?.wedding_time as string) ?? DEFAULT_SETTINGS.weddingTime,
    venueName: (weddingInfo?.venue_name as string) ?? DEFAULT_SETTINGS.venueName,
    venueAddress: (weddingInfo?.venue_address as string) ?? DEFAULT_SETTINGS.venueAddress,
    venueMapUrl: (weddingInfo?.google_map_link as string) ?? DEFAULT_SETTINGS.venueMapUrl,
    giftMessage: gift?.gift_message ?? DEFAULT_SETTINGS.giftMessage,
    giftBankName: gift?.bank_details?.bank_name ?? DEFAULT_SETTINGS.giftBankName,
    giftAccountNo: gift?.bank_details?.account_no ?? DEFAULT_SETTINGS.giftAccountNo,
    giftAccountName: gift?.bank_details?.account_name ?? DEFAULT_SETTINGS.giftAccountName,
    giftQrCodeUrl: gift?.qr_code_url ?? DEFAULT_SETTINGS.giftQrCodeUrl,
    giftEnabled: gift?.is_enabled ?? DEFAULT_SETTINGS.giftEnabled,
    musicUrl: music?.is_enabled !== false ? (music?.track_url ?? DEFAULT_SETTINGS.musicUrl) : '',
  };
}

export async function getSettings(): Promise<WeddingSettings> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    return getLocalStorage('wedding_settings', DEFAULT_SETTINGS);
  }

  const client = getReadClient();
  if (!client) return DEFAULT_SETTINGS;

  try {
    const [infoRes, brideGroomRes, familiesRes, giftRes, musicRes] = await Promise.all([
      client.from('wedding_info').select('*').limit(1).maybeSingle(),
      client.from('bride_groom').select('*'),
      client.from('families').select('*'),
      client.from('gift_info').select('*').limit(1).maybeSingle(),
      client.from('music_settings').select('*').limit(1).maybeSingle(),
    ]);

    if (infoRes.error && infoRes.error.code !== 'PGRST116') {
      console.warn('Settings fetch error:', infoRes.error.message);
      return DEFAULT_SETTINGS;
    }

    return assembleSettings(
      infoRes.data,
      (brideGroomRes.data ?? []) as BrideGroomRow[],
      (familiesRes.data ?? []) as FamilyRow[],
      giftRes.data as GiftInfoRow | null,
      musicRes.data as MusicSettingsRow | null
    );
  } catch (e) {
    console.error('Failed to fetch settings', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: WeddingSettings): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalStorage('wedding_settings', settings);
    return;
  }
  throw new Error('Use admin API routes to save settings when Supabase is configured.');
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const stored = getLocalStorage<TimelineEvent[]>('timeline_events', DEFAULT_TIMELINE);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }

  const client = getReadClient();
  if (!client) return DEFAULT_TIMELINE;

  const { data, error } = await client
    .from('timeline_events')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Timeline fetch failed', error);
    return DEFAULT_TIMELINE;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    event_date: row.date,
    title: row.title,
    description: row.description,
    image_url: row.image_url ?? '',
    sort_order: row.order_index + 1,
  }));
}

export async function saveTimeline(_events: TimelineEvent[]): Promise<void> {
  throw new Error('Use admin API routes to save timeline when Supabase is configured.');
}

export async function getProgram(): Promise<ProgramItem[]> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const stored = getLocalStorage<ProgramItem[]>('program_items', DEFAULT_PROGRAM);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }

  const client = getReadClient();
  if (!client) return DEFAULT_PROGRAM;

  const { data, error } = await client
    .from('wedding_program')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Program fetch failed', error);
    return DEFAULT_PROGRAM;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    event_time: row.time,
    title: row.event_title,
    description: row.description ?? undefined,
    sort_order: row.order_index + 1,
  }));
}

export async function saveProgram(_items: ProgramItem[]): Promise<void> {
  throw new Error('Use admin API routes to save program when Supabase is configured.');
}

export async function getGallery(): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const stored = getLocalStorage<GalleryImage[]>('gallery_images', DEFAULT_GALLERY);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }

  const client = getReadClient();
  if (!client) return DEFAULT_GALLERY;

  const { data, error } = await client
    .from('gallery_images')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Gallery fetch failed', error);
    return DEFAULT_GALLERY;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    image_url: row.image_url,
    caption: row.caption ?? undefined,
    sort_order: row.order_index + 1,
  }));
}

export async function saveGallery(_images: GalleryImage[]): Promise<void> {
  throw new Error('Use admin API routes to save gallery when Supabase is configured.');
}

export async function getWishes(): Promise<GuestWish[]> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const stored = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    return stored.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const client = getReadClient();
  if (!client) return DEFAULT_WISHES;

  const { data, error } = await client
    .from('guest_wishes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Wishes fetch failed', error);
    return DEFAULT_WISHES;
  }

  return data ?? [];
}

export async function addWish(name: string, message: string): Promise<GuestWish> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const newWish: GuestWish = {
      id: 'w-' + Math.random().toString(36).slice(2, 9),
      name,
      message,
      created_at: new Date().toISOString(),
    };
    const wishes = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    setLocalStorage('guest_wishes', [newWish, ...wishes]);
    return newWish;
  }

  const res = await fetch('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to submit wish');
  }

  return res.json();
}

export async function deleteWish(id: string): Promise<void> {
  if (!isSupabaseConfigured && !isSupabaseAdminConfigured) {
    const wishes = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    setLocalStorage('guest_wishes', wishes.filter((w) => w.id !== id));
    return;
  }

  throw new Error('Use admin API to delete wishes when Supabase is configured.');
}
