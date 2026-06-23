import { createClient } from '@supabase/supabase-js';
import { WeddingSettings, TimelineEvent, ProgramItem, GalleryImage, GuestWish } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// Seed Data Definitions (Fallbacks)
// ==========================================

const DEFAULT_SETTINGS: WeddingSettings = {
  brideName: "Sophia",
  brideFullName: "Sophia Evelyn Bennett",
  brideIntro: "A software developer who loves painting and hiking, capturing the beauty of life in every brush stroke and step.",
  brideFather: "Charles Bennett",
  brideMother: "Helena Bennett",
  brideFamilyBlessing: "We are overjoyed to welcome Liam into our family and bless this beautiful union with all our hearts.",
  groomName: "Liam",
  groomFullName: "Liam Alexander Carter",
  groomIntro: "An architect who finds harmony in designs and nature, passionate about building a beautiful future together.",
  groomFather: "Arthur Carter",
  groomMother: "Beatrice Carter",
  groomFamilyBlessing: "Sophia has brought so much light into Liam's life. We bless their journey ahead as husband and wife.",
  weddingDate: "2026-09-20", // Configured to count down nicely
  weddingTime: "16:00",
  venueName: "The Grand Conservatory & Botanical Gardens",
  venueAddress: "1000 Conservatory Dr, San Francisco, CA 94118",
  venueMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2847970725514!2d-122.46231268468222!3d37.77284697975971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085876dbbfa136d%3A0xc07c744f4773489!2sConservatory%20of%20Flowers!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus",
  giftMessage: "Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, a contribution towards our future home together would be warmly appreciated.",
  giftBankName: "Royal Gold Bank",
  giftAccountNo: "123-4567-890",
  giftAccountName: "Liam & Sophia Joint Account",
  giftQrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://github.com/google-deepmind",
  giftEnabled: true,
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

const DEFAULT_TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    event_date: "June 2021",
    title: "First Meeting",
    description: "We crossed paths at a local coffee shop. Liam spilled coffee, Sophia laughed, and our story began.",
    image_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
    sort_order: 1
  },
  {
    id: "t2",
    event_date: "September 2021",
    title: "Friendship to Love",
    description: "Months of sharing books, hiking trails, and endless late-night chats grew into a deep, beautiful bond.",
    image_url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
    sort_order: 2
  },
  {
    id: "t3",
    event_date: "May 2023",
    title: "First Official Trip",
    description: "Exploring the coastal cliffs of Big Sur, we realized we wanted to explore the rest of our lives together.",
    image_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
    sort_order: 3
  },
  {
    id: "t4",
    event_date: "December 2024",
    title: "The Proposal",
    description: "Under the starry sky of Lake Tahoe, Liam got down on one knee, and Sophia tearfully said Yes!",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    sort_order: 4
  },
  {
    id: "t5",
    event_date: "March 2026",
    title: "Wedding Preparations",
    description: "Selecting rings, testing cakes, and designing invitations—every step brought us closer to our big day.",
    image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
    sort_order: 5
  },
  {
    id: "t6",
    event_date: "September 20, 2026",
    title: "The Wedding Day",
    description: "The day we promise forever. We can't wait to share this magical milestone with you!",
    image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80",
    sort_order: 6
  }
];

const DEFAULT_PROGRAM: ProgramItem[] = [
  { id: "p1", event_time: "15:30", title: "Guest Arrival", description: "Welcome drinks and ambient music in the garden.", sort_order: 1 },
  { id: "p2", event_time: "16:00", title: "Wedding Ceremony", description: "Vows exchange under the floral canopy.", sort_order: 2 },
  { id: "p3", event_time: "17:00", title: "Photography & Cocktails", description: "Family photos, finger food, and celebratory drinks.", sort_order: 3 },
  { id: "p4", event_time: "18:30", title: "Grand Reception", description: "Welcome the bride & groom, dinner service commences.", sort_order: 4 },
  { id: "p5", event_time: "20:00", title: "Cake Cutting & Toast", description: "Champagne toast and words of love from family.", sort_order: 5 },
  { id: "p6", event_time: "21:00", title: "Dance Party & Closing", description: "Opening the dance floor for celebrations.", sort_order: 6 }
];

const DEFAULT_GALLERY: GalleryImage[] = [
  { id: "g1", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80", caption: "Our Engagement Ring", sort_order: 1 },
  { id: "g2", image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80", caption: "Joyful Moments", sort_order: 2 },
  { id: "g3", image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80", caption: "Details of Love", sort_order: 3 },
  { id: "g4", image_url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80", caption: "Beautiful Decor", sort_order: 4 },
  { id: "g5", image_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80", caption: "A Dance to Remember", sort_order: 5 },
  { id: "g6", image_url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80", caption: "Walking in Love", sort_order: 6 }
];

const DEFAULT_WISHES: GuestWish[] = [
  { id: "w1", name: "Eleanor & Mark", message: "Congratulations Sophia and Liam! Wishing you a lifetime of love, laughter, and endless adventure together. Cheers!", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "w2", name: "David K.", message: "So happy for you both. May your love grow stronger each passing day. Can't wait to celebrate with you!", created_at: new Date(Date.now() - 86400000).toISOString() }
];

// Helper to get from local storage safely
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key: " + key, error);
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing localStorage key: " + key, error);
  }
};

// ==========================================
// Unified API layer
// ==========================================

export async function getSettings(): Promise<WeddingSettings> {
  if (!isSupabaseConfigured) {
    return getLocalStorage<WeddingSettings>('wedding_settings', DEFAULT_SETTINGS);
  }
  try {
    const { data, error } = await supabase!
      .from('wedding_settings')
      .select('*');
    
    if (error || !data || data.length === 0) {
      console.warn("Supabase settings fetch empty, returning fallback settings.");
      return DEFAULT_SETTINGS;
    }
    
    // settings table stores key-value pairs. Let's merge them into a single settings object.
    const settings = { ...DEFAULT_SETTINGS };
    data.forEach((row: { key: string; value: any }) => {
      if (row.key in settings) {
        // @ts-ignore
        settings[row.key] = row.value;
      }
    });
    return settings;
  } catch (e) {
    console.error("Failed to fetch settings from Supabase, falling back", e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: WeddingSettings): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalStorage('wedding_settings', settings);
    return;
  }
  
  // Upsert settings keys
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase!
    .from('wedding_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  if (!isSupabaseConfigured) {
    const stored = getLocalStorage<TimelineEvent[]>('timeline_events', DEFAULT_TIMELINE);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase!
    .from('timeline_events')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error("Supabase timeline fetch failed", error);
    return DEFAULT_TIMELINE;
  }
  return data || [];
}

export async function saveTimeline(events: TimelineEvent[]): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalStorage('timeline_events', events);
    return;
  }
  
  // For simplicity, we delete all and insert new on edit dashboard, or upsert.
  // We'll write clean dashboard interfaces. Let's write upsert functions or basic direct APIs.
  // To keep admin interface simple, the dashboard can call saveTimeline to write full array.
  // Delete all existing and write the new ones.
  const { error: delError } = await supabase!
    .from('timeline_events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // match all

  if (delError) throw delError;

  if (events.length > 0) {
    // Format without id if they are new, or make sure IDs are valid uuids.
    const formattedEvents = events.map(({ id, ...rest }, index) => {
      // Ensure we assign a clean index order
      const eventObj: any = { ...rest, sort_order: index + 1 };
      // Check if ID is a temporary string (e.g. from local UI creation like 't1', 'new-1'), if so let database generate UUID
      if (id && id.length > 5 && !id.startsWith('new-') && !id.startsWith('t')) {
        eventObj.id = id;
      }
      return eventObj;
    });

    const { error: insError } = await supabase!
      .from('timeline_events')
      .insert(formattedEvents);

    if (insError) throw insError;
  }
}

export async function getProgram(): Promise<ProgramItem[]> {
  if (!isSupabaseConfigured) {
    const stored = getLocalStorage<ProgramItem[]>('program_items', DEFAULT_PROGRAM);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase!
    .from('program_items')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error("Supabase program fetch failed", error);
    return DEFAULT_PROGRAM;
  }
  return data || [];
}

export async function saveProgram(items: ProgramItem[]): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalStorage('program_items', items);
    return;
  }
  
  const { error: delError } = await supabase!
    .from('program_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delError) throw delError;

  if (items.length > 0) {
    const formattedItems = items.map(({ id, ...rest }, index) => {
      const itemObj: any = { ...rest, sort_order: index + 1 };
      if (id && id.length > 5 && !id.startsWith('new-') && !id.startsWith('p')) {
        itemObj.id = id;
      }
      return itemObj;
    });

    const { error: insError } = await supabase!
      .from('program_items')
      .insert(formattedItems);

    if (insError) throw insError;
  }
}

export async function getGallery(): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured) {
    const stored = getLocalStorage<GalleryImage[]>('gallery_images', DEFAULT_GALLERY);
    return stored.sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase!
    .from('gallery_images')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error("Supabase gallery fetch failed", error);
    return DEFAULT_GALLERY;
  }
  return data || [];
}

export async function saveGallery(images: GalleryImage[]): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalStorage('gallery_images', images);
    return;
  }
  
  const { error: delError } = await supabase!
    .from('gallery_images')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delError) throw delError;

  if (images.length > 0) {
    const formattedImages = images.map(({ id, ...rest }, index) => {
      const imgObj: any = { ...rest, sort_order: index + 1 };
      if (id && id.length > 5 && !id.startsWith('new-') && !id.startsWith('g')) {
        imgObj.id = id;
      }
      return imgObj;
    });

    const { error: insError } = await supabase!
      .from('gallery_images')
      .insert(formattedImages);

    if (insError) throw insError;
  }
}

export async function getWishes(): Promise<GuestWish[]> {
  if (!isSupabaseConfigured) {
    const stored = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    return stored.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const { data, error } = await supabase!
    .from('guest_wishes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Supabase wishes fetch failed", error);
    return DEFAULT_WISHES;
  }
  return data || [];
}

export async function addWish(name: string, message: string): Promise<GuestWish> {
  const newWish: GuestWish = {
    id: isSupabaseConfigured ? undefined as any : 'w-' + Math.random().toString(36).substr(2, 9),
    name,
    message,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const wishes = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    const updated = [newWish, ...wishes];
    setLocalStorage('guest_wishes', updated);
    return newWish;
  }

  const { data, error } = await supabase!
    .from('guest_wishes')
    .insert([newWish])
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteWish(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const wishes = getLocalStorage<GuestWish[]>('guest_wishes', DEFAULT_WISHES);
    const updated = wishes.filter(w => w.id !== id);
    setLocalStorage('guest_wishes', updated);
    return;
  }

  const { error } = await supabase!
    .from('guest_wishes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
