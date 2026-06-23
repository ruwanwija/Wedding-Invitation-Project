export interface WeddingSettings {
  brideName: string;
  brideFullName: string;
  brideIntro: string;
  brideFather: string;
  brideMother: string;
  brideFamilyBlessing: string;
  groomName: string;
  groomFullName: string;
  groomIntro: string;
  groomFather: string;
  groomMother: string;
  groomFamilyBlessing: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  giftMessage: string;
  giftBankName: string;
  giftAccountNo: string;
  giftAccountName: string;
  giftQrCodeUrl: string;
  giftEnabled: boolean;
  musicUrl: string;
}

export interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface ProgramItem {
  id: string;
  event_time: string;
  title: string;
  description?: string;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
}

export interface GuestWish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

// Normalized Supabase table types
export interface WeddingInfoRow {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  google_map_link: string;
  invitation_message: string | null;
  created_at: string;
  updated_at?: string;
}

export interface BrideGroomRow {
  id: string;
  type: 'bride' | 'groom';
  full_name: string;
  photo_url: string | null;
  intro: string;
  father_name: string;
  mother_name: string;
}

export interface FamilyRow {
  id: string;
  side: 'bride' | 'groom';
  parents_names: string;
  blessing_message: string;
}

export interface TimelineEventRow {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string | null;
  order_index: number;
  created_at: string;
}

export interface WeddingProgramRow {
  id: string;
  time: string;
  event_title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface GalleryImageRow {
  id: string;
  image_url: string;
  caption: string | null;
  order_index: number;
  created_at: string;
}

export interface MusicSettingsRow {
  id: string;
  track_url: string;
  volume: number;
  is_enabled: boolean;
}

export interface GiftInfoRow {
  id: string;
  gift_message: string;
  bank_details: {
    bank_name: string;
    account_no: string;
    account_name: string;
  };
  qr_code_url: string | null;
  is_enabled: boolean;
}

export type AdminTab =
  | 'settings'
  | 'timeline'
  | 'program'
  | 'gallery'
  | 'wishes'
  | 'gifts'
  | 'music';

export type StorageBucket =
  | 'bride-groom-images'
  | 'gallery-images'
  | 'timeline-images'
  | 'music-tracks'
  | 'qr-codes';
