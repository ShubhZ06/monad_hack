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

-- Note: Row Level Security (RLS) can be enabled later for production.

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

-- Insert some dummy communities to start with
INSERT INTO public.communities (name, description, member_count) VALUES 
('NYU Builders', 'Official community for NYU students building on Monad', 142),
('Columbia Crypto', 'Columbia University Blockchain and Crypto Club', 89),
('Monad NYC', 'General Monad enthusiasts in the New York area', 450);
