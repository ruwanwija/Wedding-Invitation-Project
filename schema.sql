-- =========================================================================
-- WEDDING INVITATION ADMIN — SUPABASE SQL SCHEMA
-- Run this script in your Supabase SQL Editor
-- =========================================================================

create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- Core tables
-- -------------------------------------------------------------------------

create table if not exists public.wedding_info (
  id uuid default gen_random_uuid() primary key,
  bride_name text not null,
  groom_name text not null,
  wedding_date date not null,
  wedding_time text not null,
  venue_name text not null,
  venue_address text not null,
  google_map_link text not null,
  invitation_message text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.bride_groom (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('bride', 'groom')),
  full_name text not null,
  photo_url text,
  intro text not null,
  father_name text not null,
  mother_name text not null,
  unique (type)
);

create table if not exists public.families (
  id uuid default gen_random_uuid() primary key,
  side text not null check (side in ('bride', 'groom')),
  parents_names text not null,
  blessing_message text not null,
  unique (side)
);

create table if not exists public.timeline_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null,
  description text not null,
  image_url text,
  order_index integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.wedding_program (
  id uuid default gen_random_uuid() primary key,
  time text not null,
  event_title text not null,
  description text,
  order_index integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.gallery_images (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  order_index integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.guest_wishes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  message text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.music_settings (
  id uuid default gen_random_uuid() primary key,
  track_url text not null default '',
  volume numeric(3,2) default 0.5 check (volume >= 0 and volume <= 1),
  is_enabled boolean default true not null
);

create table if not exists public.gift_info (
  id uuid default gen_random_uuid() primary key,
  gift_message text not null,
  bank_details jsonb not null default '{}'::jsonb,
  qr_code_url text,
  is_enabled boolean default true not null
);

-- -------------------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------------------

alter table public.wedding_info enable row level security;
alter table public.bride_groom enable row level security;
alter table public.families enable row level security;
alter table public.timeline_events enable row level security;
alter table public.wedding_program enable row level security;
alter table public.gallery_images enable row level security;
alter table public.guest_wishes enable row level security;
alter table public.music_settings enable row level security;
alter table public.gift_info enable row level security;

-- Public read access
create policy "Public read wedding_info" on public.wedding_info for select using (true);
create policy "Public read bride_groom" on public.bride_groom for select using (true);
create policy "Public read families" on public.families for select using (true);
create policy "Public read timeline" on public.timeline_events for select using (true);
create policy "Public read program" on public.wedding_program for select using (true);
create policy "Public read gallery" on public.gallery_images for select using (true);
create policy "Public read wishes" on public.guest_wishes for select using (true);
create policy "Public read music" on public.music_settings for select using (true);
create policy "Public read gift" on public.gift_info for select using (true);

-- Guest wish submissions (public insert only)
create policy "Public insert wishes" on public.guest_wishes for insert with check (true);

-- Authenticated admin write access
create policy "Admin insert wedding_info" on public.wedding_info for insert with check (auth.role() = 'authenticated');
create policy "Admin update wedding_info" on public.wedding_info for update using (auth.role() = 'authenticated');
create policy "Admin delete wedding_info" on public.wedding_info for delete using (auth.role() = 'authenticated');

create policy "Admin insert bride_groom" on public.bride_groom for insert with check (auth.role() = 'authenticated');
create policy "Admin update bride_groom" on public.bride_groom for update using (auth.role() = 'authenticated');
create policy "Admin delete bride_groom" on public.bride_groom for delete using (auth.role() = 'authenticated');

create policy "Admin insert families" on public.families for insert with check (auth.role() = 'authenticated');
create policy "Admin update families" on public.families for update using (auth.role() = 'authenticated');
create policy "Admin delete families" on public.families for delete using (auth.role() = 'authenticated');

create policy "Admin insert timeline" on public.timeline_events for insert with check (auth.role() = 'authenticated');
create policy "Admin update timeline" on public.timeline_events for update using (auth.role() = 'authenticated');
create policy "Admin delete timeline" on public.timeline_events for delete using (auth.role() = 'authenticated');

create policy "Admin insert program" on public.wedding_program for insert with check (auth.role() = 'authenticated');
create policy "Admin update program" on public.wedding_program for update using (auth.role() = 'authenticated');
create policy "Admin delete program" on public.wedding_program for delete using (auth.role() = 'authenticated');

create policy "Admin insert gallery" on public.gallery_images for insert with check (auth.role() = 'authenticated');
create policy "Admin update gallery" on public.gallery_images for update using (auth.role() = 'authenticated');
create policy "Admin delete gallery" on public.gallery_images for delete using (auth.role() = 'authenticated');

create policy "Admin delete wishes" on public.guest_wishes for delete using (auth.role() = 'authenticated');

create policy "Admin insert music" on public.music_settings for insert with check (auth.role() = 'authenticated');
create policy "Admin update music" on public.music_settings for update using (auth.role() = 'authenticated');
create policy "Admin delete music" on public.music_settings for delete using (auth.role() = 'authenticated');

create policy "Admin insert gift" on public.gift_info for insert with check (auth.role() = 'authenticated');
create policy "Admin update gift" on public.gift_info for update using (auth.role() = 'authenticated');
create policy "Admin delete gift" on public.gift_info for delete using (auth.role() = 'authenticated');

-- -------------------------------------------------------------------------
-- Storage buckets
-- -------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('bride-groom-images', 'bride-groom-images', true),
  ('gallery-images', 'gallery-images', true),
  ('timeline-images', 'timeline-images', true),
  ('music-tracks', 'music-tracks', true),
  ('qr-codes', 'qr-codes', true)
on conflict (id) do nothing;

-- Storage policies: public read, authenticated upload/update/delete
create policy "Public read storage" on storage.objects for select using (bucket_id in (
  'bride-groom-images', 'gallery-images', 'timeline-images', 'music-tracks', 'qr-codes'
));

create policy "Admin upload storage" on storage.objects for insert with check (
  bucket_id in ('bride-groom-images', 'gallery-images', 'timeline-images', 'music-tracks', 'qr-codes')
  and auth.role() = 'authenticated'
);

create policy "Admin update storage" on storage.objects for update using (
  bucket_id in ('bride-groom-images', 'gallery-images', 'timeline-images', 'music-tracks', 'qr-codes')
  and auth.role() = 'authenticated'
);

create policy "Admin delete storage" on storage.objects for delete using (
  bucket_id in ('bride-groom-images', 'gallery-images', 'timeline-images', 'music-tracks', 'qr-codes')
  and auth.role() = 'authenticated'
);

-- -------------------------------------------------------------------------
-- Seed data
-- -------------------------------------------------------------------------

insert into public.wedding_info (
  bride_name, groom_name, wedding_date, wedding_time,
  venue_name, venue_address, google_map_link, invitation_message
) values (
  'Sophia', 'Liam', '2026-09-20', '16:00',
  'The Grand Conservatory & Botanical Gardens',
  '1000 Conservatory Dr, San Francisco, CA 94118',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2847970725514!2d-122.46231268468222!3d37.77284697975971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085876dbbfa136d%3A0xc07c744f4773489!2sConservatory%20of%20Flowers!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus',
  'Together with our families, we warmly invite you to celebrate our wedding.'
) on conflict do nothing;

insert into public.bride_groom (type, full_name, intro, father_name, mother_name) values
('bride', 'Sophia Evelyn Bennett', 'A software developer who loves painting and hiking.', 'Charles Bennett', 'Helena Bennett'),
('groom', 'Liam Alexander Carter', 'An architect who finds harmony in designs and nature.', 'Arthur Carter', 'Beatrice Carter')
on conflict (type) do nothing;

insert into public.families (side, parents_names, blessing_message) values
('bride', 'Charles & Helena Bennett', 'We are overjoyed to welcome Liam into our family and bless this beautiful union.'),
('groom', 'Arthur & Beatrice Carter', 'Sophia has brought so much light into Liam''s life. We bless their journey ahead.')
on conflict (side) do nothing;

insert into public.timeline_events (title, date, description, image_url, order_index) values
('First Meeting', 'June 2021', 'We crossed paths at a local coffee shop. Liam spilled coffee, Sophia laughed, and our story began.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80', 0),
('Friendship to Love', 'September 2021', 'Months of sharing books, hiking trails, and endless late-night chats grew into a deep bond.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80', 1),
('The Proposal', 'December 2024', 'Under the starry sky of Lake Tahoe, Liam got down on one knee, and Sophia tearfully said Yes!', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80', 2),
('The Wedding Day', 'September 20, 2026', 'The day we promise forever. We can''t wait to share this magical milestone with you!', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80', 3)
on conflict do nothing;

insert into public.wedding_program (time, event_title, description, order_index) values
('15:30', 'Guest Arrival', 'Welcome drinks and ambient music in the garden.', 0),
('16:00', 'Wedding Ceremony', 'Vows exchange under the floral canopy.', 1),
('17:00', 'Photography & Cocktails', 'Family photos, finger food, and celebratory drinks.', 2),
('18:30', 'Grand Reception', 'Welcome the bride & groom, dinner service commences.', 3),
('20:00', 'Cake Cutting & Toast', 'Champagne toast and words of love from family.', 4),
('21:00', 'Dance Party & Closing', 'Opening the dance floor for celebrations.', 5)
on conflict do nothing;

insert into public.gallery_images (image_url, caption, order_index) values
('https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80', 'Our Engagement Ring', 0),
('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80', 'Joyful Moments', 1),
('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80', 'Details of Love', 2)
on conflict do nothing;

insert into public.guest_wishes (name, message) values
('Eleanor & Mark', 'Congratulations Sophia and Liam! Wishing you a lifetime of love and laughter.'),
('David K.', 'So happy for you both. May your love grow stronger each passing day.')
on conflict do nothing;

insert into public.music_settings (track_url, volume, is_enabled) values
('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 0.5, true)
on conflict do nothing;

insert into public.gift_info (gift_message, bank_details, qr_code_url, is_enabled) values
(
  'Your presence at our wedding is the greatest gift of all.',
  '{"bank_name":"Royal Gold Bank","account_no":"123-4567-890","account_name":"Liam & Sophia Joint Account"}'::jsonb,
  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=wedding-gift',
  true
)
on conflict do nothing;

-- -------------------------------------------------------------------------
-- Admin Registration & Email OTP Authentication Tables
-- -------------------------------------------------------------------------

create table if not exists public.admin_users (
  id uuid primary key,
  full_name text not null,
  mobile_number text not null,
  email text not null unique,
  city text not null,
  is_verified boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- -------------------------------------------------------------------------
-- Guest Management System Tables
-- -------------------------------------------------------------------------

create table if not exists public.guests (
  id uuid default gen_random_uuid() primary key,
  guest_name text not null,
  whatsapp_number text not null unique,
  invitation_type text not null check (invitation_type in ('individual', 'spouse', 'family')),
  invitation_token text not null unique,
  invitation_link text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.guests enable row level security;

-- Policies
create policy "Public read guests" on public.guests for select using (true);
create policy "Admin insert guests" on public.guests for insert with check (auth.role() = 'authenticated');
create policy "Admin update guests" on public.guests for update using (auth.role() = 'authenticated');
create policy "Admin delete guests" on public.guests for delete using (auth.role() = 'authenticated');

create table if not exists public.invitation_visits (
  id uuid default gen_random_uuid() primary key,
  guest_id uuid references public.guests(id) on delete cascade not null,
  visited_at timestamptz default timezone('utc'::text, now()) not null,
  device_type text not null,
  browser text not null,
  ip_address text not null
);

-- Enable RLS
alter table public.invitation_visits enable row level security;

-- Policies
create policy "Public insert visits" on public.invitation_visits for insert with check (true);
create policy "Admin read visits" on public.invitation_visits for select using (auth.role() = 'authenticated');

-- -------------------------------------------------------------------------
-- RSVP Confirmation Extensions
-- -------------------------------------------------------------------------
alter table public.guests
add column if not exists rsvp_status text check (rsvp_status in ('attending', 'declined')),
add column if not exists rsvp_guests_count integer default 0,
add column if not exists rsvp_message text,
add column if not exists rsvp_submitted_at timestamptz;

