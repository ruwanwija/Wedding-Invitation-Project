-- =========================================================================
-- PREMIUM WEDDING INVITATION WEBSITE - SUPABASE SQL SCHEMA MIGRATION
-- Copy and run this script in your Supabase SQL Editor
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Table: Wedding Core Settings (Key-Value style)
create table if not exists public.wedding_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table: Our Journey Timeline
create table if not exists public.timeline_events (
    id uuid default gen_random_uuid() primary key,
    event_date text not null,
    title text not null,
    description text not null,
    image_url text,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table: Wedding Program Schedule
create table if not exists public.program_items (
    id uuid default gen_random_uuid() primary key,
    event_time text not null,
    title text not null,
    description text,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Table: Photo Gallery
create table if not exists public.gallery_images (
    id uuid default gen_random_uuid() primary key,
    image_url text not null,
    caption text,
    sort_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Table: Guest Wishes (Guestbook messages)
create table if not exists public.guest_wishes (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.wedding_settings enable row level security;
alter table public.timeline_events enable row level security;
alter table public.program_items enable row level security;
alter table public.gallery_images enable row level security;
alter table public.guest_wishes enable row level security;

-- Create Policies for public read-only access (anyone can view the details)
create policy "Allow public read access to settings" on public.wedding_settings for select using (true);
create policy "Allow public read access to timeline" on public.timeline_events for select using (true);
create policy "Allow public read access to program" on public.program_items for select using (true);
create policy "Allow public read access to gallery" on public.gallery_images for select using (true);
create policy "Allow public read access to wishes" on public.guest_wishes for select using (true);

-- Create Policy for guest wish submissions (anyone can insert a wish)
create policy "Allow public to insert wishes" on public.guest_wishes for insert with check (true);

-- Create Policies for admin dashboard modifications (authenticated users only)
create policy "Allow authenticated insert to settings" on public.wedding_settings for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update to settings" on public.wedding_settings for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated delete to settings" on public.wedding_settings for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert to timeline" on public.timeline_events for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update to timeline" on public.timeline_events for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated delete to timeline" on public.timeline_events for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert to program" on public.program_items for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update to program" on public.program_items for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated delete to program" on public.program_items for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated insert to gallery" on public.gallery_images for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated update to gallery" on public.gallery_images for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated delete to gallery" on public.gallery_images for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated delete to wishes" on public.guest_wishes for delete using (auth.role() = 'authenticated');


-- =========================================================================
-- SEED DATA (INITIAL VALUES)
-- =========================================================================

-- Insert Initial Settings
insert into public.wedding_settings (key, value) values
('brideName', '"Sophia"'),
('brideFullName', '"Sophia Evelyn Bennett"'),
('brideIntro', '"A software developer who loves painting and hiking, capturing the beauty of life in every brush stroke and step."'),
('brideFather', '"Charles Bennett"'),
('brideMother', '"Helena Bennett"'),
('brideFamilyBlessing', '"We are overjoyed to welcome Liam into our family and bless this beautiful union with all our hearts."'),
('groomName', '"Liam"'),
('groomFullName', '"Liam Alexander Carter"'),
('groomIntro', '"An architect who finds harmony in designs and nature, passionate about building a beautiful future together."'),
('groomFather', '"Arthur Carter"'),
('groomMother', '"Beatrice Carter"'),
('groomFamilyBlessing', '"Sophia has brought so much light into Liam\'s life. We bless their journey ahead as husband and wife."'),
('weddingDate', '"2026-09-20"'),
('weddingTime', '"16:00"'),
('venueName', '"The Grand Conservatory & Botanical Gardens"'),
('venueAddress', '"1000 Conservatory Dr, San Francisco, CA 94118"'),
('venueMapUrl', '"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2847970725514!2d-122.46231268468222!3d37.77284697975971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085876dbbfa136d%3A0xc07c744f4773489!2sConservatory%20of%20Flowers!5e0!3m2!1sen!2sus!4v1655000000000!5m2!1sen!2sus"'),
('giftMessage', '"Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, a contribution towards our future home together would be warmly appreciated."'),
('giftBankName', '"Royal Gold Bank"'),
('giftAccountNo', '"123-4567-890"'),
('giftAccountName', '"Liam & Sophia Joint Account"'),
('giftQrCodeUrl', '"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://github.com/google-deepmind"'),
('giftEnabled', 'true'),
('musicUrl', '"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"')
on conflict (key) do nothing;

-- Insert Initial Timeline Events
insert into public.timeline_events (event_date, title, description, image_url, sort_order) values
('June 2021', 'First Meeting', 'We crossed paths at a local coffee shop. Liam spilled coffee, Sophia laughed, and our story began.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80', 1),
('September 2021', 'Friendship to Love', 'Months of sharing books, hiking trails, and endless late-night chats grew into a deep, beautiful bond.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80', 2),
('May 2023', 'First Official Trip', 'Exploring the coastal cliffs of Big Sur, we realized we wanted to explore the rest of our lives together.', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80', 3),
('December 2024', 'The Proposal', 'Under the starry sky of Lake Tahoe, Liam got down on one knee, and Sophia tearfully said Yes!', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80', 4),
('March 2026', 'Wedding Preparations', 'Selecting rings, testing cakes, and designing invitations—every step brought us closer to our big day.', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80', 5),
('September 20, 2026', 'The Wedding Day', 'The day we promise forever. We can\'t wait to share this magical milestone with you!', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80', 6)
on conflict do nothing;

-- Insert Initial Program Items
insert into public.program_items (event_time, title, description, sort_order) values
('15:30', 'Guest Arrival', 'Welcome drinks and ambient music in the garden.', 1),
('16:00', 'Wedding Ceremony', 'Vows exchange under the floral canopy.', 2),
('17:00', 'Photography & Cocktails', 'Family photos, finger food, and celebratory drinks.', 3),
('18:30', 'Grand Reception', 'Welcome the bride & groom, dinner service commences.', 4),
('20:00', 'Cake Cutting & Toast', 'Champagne toast and words of love from family.', 5),
('21:00', 'Dance Party & Closing', 'Opening the dance floor for celebrations.', 6)
on conflict do nothing;

-- Insert Initial Gallery Images
insert into public.gallery_images (image_url, caption, sort_order) values
('https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80', 'Our Engagement Ring', 1),
('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80', 'Joyful Moments', 2),
('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80', 'Details of Love', 3),
('https://images.unsplash.com/photo-1519225495810-7512c696505a?w=800&auto=format&fit=crop&q=80', 'Beautiful Decor', 4),
('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80', 'A Dance to Remember', 5),
('https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80', 'Walking in Love', 6)
on conflict do nothing;

-- Insert Initial wishes
insert into public.guest_wishes (name, message, created_at) values
('Eleanor & Mark', 'Congratulations Sophia and Liam! Wishing you a lifetime of love, laughter, and endless adventure together. Cheers!', now() - interval '2 days'),
('David K.', 'So happy for you both. May your love grow stronger each passing day. Can\'t wait to celebrate with you!', now() - interval '1 day')
on conflict do nothing;
