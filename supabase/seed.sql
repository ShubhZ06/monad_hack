-- ============================================================
-- FULL SETUP: Creates all tables + seeds demo data
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Venues Table (For the Discovery Feed)
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    vibe_rating TEXT,
    image_url TEXT,
    reviews_count INTEGER DEFAULT 0,
    wallet_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Requests Table (For the Escrow Loop)
CREATE TABLE IF NOT EXISTS public.event_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    organizer_name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'INTEREST',
    indicative_price NUMERIC,
    currency TEXT DEFAULT 'USDC',
    target_headcount INTEGER NOT NULL,
    current_headcount INTEGER DEFAULT 0,
    event_date TIMESTAMP WITH TIME ZONE,
    monad_event_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table (For profiles and ID Verification)
CREATE TABLE IF NOT EXISTS public.users (
    wallet_address TEXT PRIMARY KEY,
    ens_name TEXT,
    is_student_verified BOOLEAN DEFAULT FALSE,
    college_id_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Soft Interest (The "I'm in" clicks)
CREATE TABLE IF NOT EXISTS public.soft_interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.event_requests(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, wallet_address)
);

-- 5. Reviews Table (For venue reviews on the Discovery Feed)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    vibe_tag TEXT,
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venue_id, wallet_address)
);

-- 6. Coupons Table (Monad Testnet NFT Discount Coupons awarded for reviews)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    venue_name TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    discount_title TEXT NOT NULL DEFAULT '20% OFF Total Bill',
    discount_code TEXT NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 20,
    token_id INTEGER,
    monad_tx_hash TEXT,
    nft_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REDEEMED', 'EXPIRED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Vendors Table (For registered event organizers, venues, sound providers)
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Event Organizer',
    description TEXT,
    contact_info TEXT,
    website_url TEXT,
    rating NUMERIC DEFAULT 4.9,
    total_completed_events INTEGER DEFAULT 14,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Vendor Bids Table (Reverse Auction Bids for Fully-Voted Events)
CREATE TABLE IF NOT EXISTS public.vendor_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.event_requests(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_wallet TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    participation_fee_mon NUMERIC DEFAULT 0.05,
    participation_fee_tx TEXT,
    price_per_head_inr NUMERIC NOT NULL,
    total_amount_inr NUMERIC NOT NULL,
    mon_equivalent NUMERIC,
    proposal_pitch TEXT NOT NULL,
    services_included TEXT[] DEFAULT '{}',
    revision_count INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'OUTBID', 'ACCEPTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. Disable RLS & Grant Access for Web3 Demo / Client Access
-- ============================================================
ALTER TABLE IF EXISTS public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.soft_interest DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_bids DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.venues TO anon, authenticated, service_role;
GRANT ALL ON public.reviews TO anon, authenticated, service_role;
GRANT ALL ON public.event_requests TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.soft_interest TO anon, authenticated, service_role;
GRANT ALL ON public.coupons TO anon, authenticated, service_role;
GRANT ALL ON public.vendors TO anon, authenticated, service_role;
GRANT ALL ON public.vendor_bids TO anon, authenticated, service_role;

-- ============================================================
-- SEED: Demo venues (Mumbai area) - Monad Cafe Demo
-- ============================================================

-- Clean up legacy venues
DELETE FROM public.venues WHERE name NOT IN ('Monad Cafe & Roastery', 'Neon Roast & Bistro');

INSERT INTO public.venues (name, type, vibe_rating, image_url, reviews_count, latitude, longitude, address) VALUES
  ('Monad Cafe & Roastery', 'Cafe', 'Insane', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop', 3, 19.1070, 72.8370, 'Juhu, Mumbai'),
  ('Neon Roast & Bistro', 'Restaurant', 'Worth it', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop', 2, 19.1245, 72.8520, 'Bandra West, Mumbai')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Demo reviews
-- ============================================================

DO $$
DECLARE
  v_monad UUID;
  v_neon UUID;
BEGIN
  SELECT id INTO v_monad FROM public.venues WHERE name = 'Monad Cafe & Roastery' LIMIT 1;
  SELECT id INTO v_neon FROM public.venues WHERE name = 'Neon Roast & Bistro' LIMIT 1;

  INSERT INTO public.reviews (venue_id, wallet_address, rating, vibe_tag, comment) VALUES
    (v_monad, '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c', 5, 'Insane', 'Perfect for working and the cold brew is elite. Fast wifi and great playlist.'),
    (v_monad, '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C', 5, 'Insane', 'The avocado toast and matcha latte combo is unreal. Aesthetic interior too.'),
    (v_monad, '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB', 4, 'Worth it', 'Good coffee, good wifi, good people. Can get noisy after 4pm though.')
  ON CONFLICT (venue_id, wallet_address) DO NOTHING;

  INSERT INTO public.reviews (venue_id, wallet_address, rating, vibe_tag, comment) VALUES
    (v_neon, '0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B', 4, 'Worth it', 'Great sourdough pizzas and espresso bar. Aesthetic ambient lighting in the evening.'),
    (v_neon, '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C', 5, 'Insane', 'Truffle fries and craft cold brews were incredible. A bit far to walk from Juhu but worth visiting.')
  ON CONFLICT (venue_id, wallet_address) DO NOTHING;

END $$;

-- ============================================================
-- SEED: Fully-Voted Demo Event + Vendor Bidding Arena
-- ============================================================

DO $$
DECLARE
  v_event_id UUID;
  v_v1 UUID;
  v_v2 UUID;
  v_v3 UUID;
BEGIN
  -- Insert/Ensure users for the 3 demo vendors
  INSERT INTO public.users (wallet_address, ens_name, role) VALUES
    ('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'neonhorizon.eth', 'VENDOR'),
    ('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'cyberbass.eth', 'VENDOR'),
    ('0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'monadrooftop.eth', 'VENDOR')
  ON CONFLICT (wallet_address) DO UPDATE SET role = 'VENDOR';

  -- Insert Vendor Profiles
  INSERT INTO public.vendors (wallet_address, business_name, category, description, rating, total_completed_events, is_verified) VALUES
    ('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'Neon Horizon Productions', 'Full Production & Audio', 'Full-service festival stages, 4K visual mapping, and immersive sound setups.', 4.8, 18, TRUE),
    ('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'CyberBass DJ & Sound Collective', 'DJ & Sound System', 'Underground bass, resident DJs, Pioneer CDJ-3000 setups, and atmospheric smoke.', 4.9, 24, TRUE),
    ('0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'Monad Rooftop Collective', 'Venue & Rooftop Experience', 'Premium rooftop experience, 360 skyline views, cocktail bar, and full audio/security.', 5.0, 31, TRUE)
  ON CONFLICT (wallet_address) DO NOTHING;

  SELECT id INTO v_v1 FROM public.vendors WHERE wallet_address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' LIMIT 1;
  SELECT id INTO v_v2 FROM public.vendors WHERE wallet_address = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' LIMIT 1;
  SELECT id INTO v_v3 FROM public.vendors WHERE wallet_address = '0x90F79bf6EB2c4f870365E785982E1f101E93b906' LIMIT 1;

  -- Insert the 100% Fully-Voted Event (50/50 Votes Met -> State: BIDDING)
  INSERT INTO public.event_requests (
    title, description, organizer_name, state, indicative_price, currency, target_headcount, current_headcount, event_date
  ) VALUES (
    'Neon Nights Rooftop Rave & Hackathon Afterparty',
    '50 verified Monad builders have voted "I am in"! Community is seeking competitive vendor proposals to host the official hackathon rooftop afterparty with stage, lighting, sound, and beverage vouchers. Minimum charge with verified package wins the organizer contract!',
    'Monad Builders DAO',
    'BIDDING',
    1500,
    'INR',
    50,
    50,
    NOW() + INTERVAL '14 days'
  ) RETURNING id INTO v_event_id;

  -- Seed 3 Competing Bids in the Reverse Auction Leaderboard Fight
  -- Vendor 1: ₹1,450 / head (Rank #3)
  INSERT INTO public.vendor_bids (
    event_id, vendor_id, vendor_wallet, vendor_name, participation_fee_mon, price_per_head_inr, total_amount_inr, mon_equivalent, proposal_pitch, services_included, revision_count, status
  ) VALUES (
    v_event_id, v_v1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'Neon Horizon Productions', 0.05, 1450, 72500, 0.18,
    'We will bring our custom truss lighting, dual laser projectors, high-definition PA system, and custom glowing neon entry wristbands for all 50 builders.',
    ARRAY['Audio Engineering', '4K Projection', 'Neon Wristbands', 'Setup & Teardown'],
    1, 'OUTBID'
  );

  -- Vendor 2: ₹1,250 / head (Rank #2 - Undercut Vendor 1)
  INSERT INTO public.vendor_bids (
    event_id, vendor_id, vendor_wallet, vendor_name, participation_fee_mon, price_per_head_inr, total_amount_inr, mon_equivalent, proposal_pitch, services_included, revision_count, status
  ) VALUES (
    v_event_id, v_v2, '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'CyberBass DJ & Sound Collective', 0.05, 1250, 62500, 0.15,
    'Live B2B DJ set featuring 2 resident artists, 18-inch subwoofers for chest-thumping bass, laser haze machines, and full soundcheck before doors open.',
    ARRAY['2 Resident DJs', 'Subwoofer Array', 'Laser & Haze Machine', 'Pro Sound Engineer'],
    2, 'OUTBID'
  );

  -- Vendor 3: ₹1,100 / head (Rank #1 - Minimum Charge Champion!)
  INSERT INTO public.vendor_bids (
    event_id, vendor_id, vendor_wallet, vendor_name, participation_fee_mon, price_per_head_inr, total_amount_inr, mon_equivalent, proposal_pitch, services_included, revision_count, status
  ) VALUES (
    v_event_id, v_v3, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'Monad Rooftop Collective', 0.05, 1100, 55000, 0.14,
    'Complete package! Private rooftop terrace access overlooking Mumbai skyline, pro sound rig, 2 resident DJs, 2 drink coupons per attendee, and professional security staff.',
    ARRAY['Private Rooftop Venue', '2 Resident DJs', 'Pro Sound Rig', '2 Drink Coupons / Head', 'Security Staff'],
    3, 'ACTIVE'
  );

END $$;


