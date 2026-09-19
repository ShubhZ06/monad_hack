-- Supabase SQL Schema for GenZ Demand & Discovery Platform

-- 1. Venues Table (For the Discovery Feed)
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Cafe', 'Club', 'Resort'
    vibe_rating TEXT, -- 'Insane', 'Worth it', 'Mid'
    image_url TEXT,
    reviews_count INTEGER DEFAULT 0,
    wallet_address TEXT, -- To map to the Monad VenueRegistry
    latitude DOUBLE PRECISION, -- GPS latitude for location-based discovery
    longitude DOUBLE PRECISION, -- GPS longitude for location-based discovery
    address TEXT, -- Human-readable address (e.g., 'Andheri West, Mumbai')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Requests Table (For the Escrow Loop)
CREATE TABLE public.event_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    organizer_name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'INTEREST', -- 'INTEREST', 'PLEDGING', 'LOCKED'
    indicative_price NUMERIC,
    currency TEXT DEFAULT 'USDC',
    target_headcount INTEGER NOT NULL,
    current_headcount INTEGER DEFAULT 0,
    event_date TIMESTAMP WITH TIME ZONE,
    monad_event_id INTEGER, -- Maps to the ID in EventEscrow.sol
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table (For profiles and ID Verification)
CREATE TABLE public.users (
    wallet_address TEXT PRIMARY KEY,
    ens_name TEXT,
    is_student_verified BOOLEAN DEFAULT FALSE,
    college_id_image_url TEXT,
    role TEXT NOT NULL DEFAULT 'USER', -- 'USER', 'VENDOR', 'ORGANIZER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Soft Interest (The "I'm in" clicks)
CREATE TABLE public.soft_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.event_requests(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, wallet_address) -- Prevent clicking "I'm in" twice
);

-- 5. Communities Table
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Community Members (Who joined what)
CREATE TABLE public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, wallet_address)
);

-- 7. Modify Event Requests to link to a Community
ALTER TABLE public.event_requests 
ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- 8. Comments Table (The conversations on Event Requests)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.event_requests(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Reviews Table (For venue reviews on the Discovery Feed)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL, -- reviewer's wallet address
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    vibe_tag TEXT, -- 'Insane', 'Worth it', 'Mid'
    comment TEXT,
    image_url TEXT, -- optional photo from reviewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venue_id, wallet_address) -- one review per user per venue
);

-- 10. Coupons Table (Monad Testnet NFT Discount Coupons awarded for reviews)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 11. Vendors Table (For registered event organizers, venues, sound providers)
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Event Organizer', -- 'Venue & Rooftop', 'DJ & Sound', 'Catering & Bar', 'Full Production'
    description TEXT,
    contact_info TEXT,
    website_url TEXT,
    rating NUMERIC DEFAULT 4.9,
    total_completed_events INTEGER DEFAULT 14,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Vendor Bids Table (Reverse Auction Bids for Fully-Voted Events)
CREATE TABLE IF NOT EXISTS public.vendor_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Disable RLS for MVP / demo testing so client app can read/write all tables
ALTER TABLE IF EXISTS public.venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.soft_interest DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_bids DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.venues TO anon, authenticated, service_role;
GRANT ALL ON public.reviews TO anon, authenticated, service_role;
GRANT ALL ON public.event_requests TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON public.soft_interest TO anon, authenticated, service_role;
GRANT ALL ON public.coupons TO anon, authenticated, service_role;
GRANT ALL ON public.communities TO anon, authenticated, service_role;
GRANT ALL ON public.community_members TO anon, authenticated, service_role;
GRANT ALL ON public.comments TO anon, authenticated, service_role;
GRANT ALL ON public.vendors TO anon, authenticated, service_role;
GRANT ALL ON public.vendor_bids TO anon, authenticated, service_role;
