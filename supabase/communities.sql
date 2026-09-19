-- SUPABASE SQL SCHEMA UPDATES (Run these in your Supabase SQL Editor)

-- 1. Communities Table
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Community Members (Who joined what)
CREATE TABLE public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, wallet_address)
);

-- 3. Modify Event Requests to link to a Community
ALTER TABLE public.event_requests 
ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

-- 4. Comments Table (The conversations on Event Requests)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.event_requests(id) ON DELETE CASCADE,
    wallet_address TEXT REFERENCES public.users(wallet_address) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
