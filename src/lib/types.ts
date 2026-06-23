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
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:MM
  venueName: string;
  venueAddress: string;
  venueMapUrl: string; // Google Maps embed src URL
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
