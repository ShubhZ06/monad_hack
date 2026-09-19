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

-- ============================================================
-- 7. Disable RLS & Grant Access for Web3 Demo / Client Access
-- ============================================================
ALTER TABLE IF EXISTS public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.soft_interest DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.venues TO anon, authenticated, service_role;
GRANT ALL ON public.reviews TO anon, authenticated, service_role;
GRANT ALL ON public.event_requests TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.soft_interest TO anon, authenticated, service_role;
GRANT ALL ON public.coupons TO anon, authenticated, service_role;

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

