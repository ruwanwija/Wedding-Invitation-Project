import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { StorageBucket, Guest, GuestAnalytics } from '@/lib/types';

async function getAuthHeaders(): Promise<HeadersInit> {
  if (!isSupabaseConfigured) return {};
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const headers = new Headers(options.headers);
  Object.entries(authHeaders).forEach(([k, v]) => headers.set(k, v));
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const adminApi = {
  getWeddingInfo: () => adminFetch('/api/wedding-info'),
  patchWeddingInfo: (body: unknown) =>
    adminFetch('/api/wedding-info', { method: 'PATCH', body: JSON.stringify(body) }),

  getBrideGroom: () => adminFetch('/api/bride-groom'),
  putBrideGroom: (body: unknown) =>
    adminFetch('/api/bride-groom', { method: 'PUT', body: JSON.stringify(body) }),

  getFamilies: () => adminFetch('/api/families'),
  putFamily: (body: unknown) =>
    adminFetch('/api/families', { method: 'PUT', body: JSON.stringify(body) }),

  getTimeline: () => adminFetch('/api/timeline'),
  createTimeline: (body: unknown) =>
    adminFetch('/api/timeline', { method: 'POST', body: JSON.stringify(body) }),
  updateTimeline: (id: string, body: unknown) =>
    adminFetch(`/api/timeline/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTimeline: (id: string) => adminFetch(`/api/timeline/${id}`, { method: 'DELETE' }),
  reorderTimeline: (ids: string[]) =>
    adminFetch('/api/timeline', { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getProgram: () => adminFetch('/api/program'),
  createProgram: (body: unknown) =>
    adminFetch('/api/program', { method: 'POST', body: JSON.stringify(body) }),
  updateProgram: (id: string, body: unknown) =>
    adminFetch(`/api/program/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProgram: (id: string) => adminFetch(`/api/program/${id}`, { method: 'DELETE' }),
  reorderProgram: (ids: string[]) =>
    adminFetch('/api/program', { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getGallery: () => adminFetch('/api/gallery'),
  createGallery: (body: unknown) =>
    adminFetch('/api/gallery', { method: 'POST', body: JSON.stringify(body) }),
  updateGallery: (id: string, body: unknown) =>
    adminFetch(`/api/gallery/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGallery: (id: string) => adminFetch(`/api/gallery/${id}`, { method: 'DELETE' }),
  reorderGallery: (ids: string[]) =>
    adminFetch('/api/gallery', { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getWishes: () => adminFetch('/api/wishes'),
  deleteWish: (id: string) => adminFetch(`/api/wishes/${id}`, { method: 'DELETE' }),

  getMusic: () => adminFetch('/api/music'),
  patchMusic: (body: unknown) =>
    adminFetch('/api/music', { method: 'PATCH', body: JSON.stringify(body) }),

  getGift: () => adminFetch('/api/gift'),
  patchGift: (body: unknown) =>
    adminFetch('/api/gift', { method: 'PATCH', body: JSON.stringify(body) }),

  uploadFile: async (file: File, bucket: StorageBucket, replacePath?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (replacePath) formData.append('replacePath', replacePath);
    return adminFetch<{ url: string; path: string; bucket: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getGuests: () => adminFetch<Guest[]>('/api/guests'),
  createGuest: (body: { guest_name: string; whatsapp_number: string; invitation_type: string }) =>
    adminFetch<Guest>('/api/guests', { method: 'POST', body: JSON.stringify(body) }),
  updateGuest: (id: string, body: { guest_name: string; whatsapp_number: string; invitation_type: string }) =>
    adminFetch<Guest>(`/api/guests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGuest: (id: string) => adminFetch<{ success: boolean }>(`/api/guests/${id}`, { method: 'DELETE' }),
  importBulkGuests: (body: { guest_name: string; whatsapp_number: string; invitation_type: string }[]) =>
    adminFetch<{ message: string; insertedCount: number; skippedCount: { duplicateInDb: number; duplicateInPayload: number; invalid: number } }>('/api/guests/bulk-import', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getGuestAnalytics: () => adminFetch<GuestAnalytics>('/api/guests/analytics'),
  submitRsvp: (body: { token: string; status: 'attending' | 'declined'; guestsCount: number; message?: string }) =>
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit RSVP');
      return data;
    }),
};

