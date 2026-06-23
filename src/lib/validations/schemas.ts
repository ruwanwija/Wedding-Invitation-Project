import { z } from 'zod';

export const weddingInfoSchema = z.object({
  bride_name: z.string().min(1).max(200),
  groom_name: z.string().min(1).max(200),
  wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wedding_time: z.string().min(1).max(20),
  venue_name: z.string().min(1).max(300),
  venue_address: z.string().min(1).max(500),
  google_map_link: z.string().url().or(z.string().startsWith('https://')),
  invitation_message: z.string().max(2000).optional().nullable(),
});

export const brideGroomSchema = z.object({
  type: z.enum(['bride', 'groom']),
  full_name: z.string().min(1).max(200),
  photo_url: z.string().url().or(z.literal('')).optional().nullable(),
  intro: z.string().min(1).max(2000),
  father_name: z.string().min(1).max(200),
  mother_name: z.string().min(1).max(200),
});

export const familySchema = z.object({
  side: z.enum(['bride', 'groom']),
  parents_names: z.string().min(1).max(300),
  blessing_message: z.string().min(1).max(2000),
});

export const timelineEventSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  image_url: z.string().url().or(z.literal('')).optional().nullable(),
  order_index: z.number().int().min(0).optional(),
});

export const weddingProgramSchema = z.object({
  time: z.string().min(1).max(20),
  event_title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  order_index: z.number().int().min(0).optional(),
});

export const galleryImageSchema = z.object({
  image_url: z.string().url(),
  caption: z.string().max(300).optional().nullable(),
  order_index: z.number().int().min(0).optional(),
});

export const guestWishSchema = z.object({
  name: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

export const musicSettingsSchema = z.object({
  track_url: z.string().url().or(z.literal('')),
  volume: z.number().min(0).max(1).optional(),
  is_enabled: z.boolean().optional(),
});

export const giftInfoSchema = z.object({
  gift_message: z.string().min(1).max(2000),
  bank_details: z.object({
    bank_name: z.string().min(1).max(200),
    account_no: z.string().min(1).max(100),
    account_name: z.string().min(1).max(200),
  }),
  qr_code_url: z.string().url().or(z.literal('')).optional().nullable(),
  is_enabled: z.boolean().optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const uploadSchema = z.object({
  bucket: z.enum([
    'bride-groom-images',
    'gallery-images',
    'timeline-images',
    'music-tracks',
    'qr-codes',
  ]),
  path: z.string().min(1).max(500).optional(),
  replacePath: z.string().max(500).optional(),
});

export type WeddingInfoInput = z.infer<typeof weddingInfoSchema>;
export type BrideGroomInput = z.infer<typeof brideGroomSchema>;
export type FamilyInput = z.infer<typeof familySchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
export type WeddingProgramInput = z.infer<typeof weddingProgramSchema>;
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
export type MusicSettingsInput = z.infer<typeof musicSettingsSchema>;
export type GiftInfoInput = z.infer<typeof giftInfoSchema>;
