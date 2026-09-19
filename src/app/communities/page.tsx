'use client';

import { useState, useEffect } from 'react';
import { WalletButton } from '@/components/WalletButton';
import { Users, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export default function CommunitiesDirectory() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities');
        const data = await res.json();
        if (data.communities) setCommunities(data.communities);
      } catch (e) {
        console.error("Failed to fetch communities", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-28">
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee7dc] text-[11px] font-semibold text-neutral-600 mb-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Verified Communities & Clubs
          </div>
          <h1 className="font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
            Find Your <span className="text-primary">Tribe</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
            Join a campus community to unlock exclusive private events, chat with fellow builders, and pool funds together.
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search universities, cities, or clubs..." 
            className="w-full bg-white border border-[#eee7dc] rounded-full py-3 pl-11 pr-4 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
          />
        </div>

        {/* Community List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center text-neutral-400 py-12 text-xs animate-pulse">Loading verified communities...</div>
          ) : communities.length === 0 ? (
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-8 text-center text-xs text-neutral-500 shadow-sm">
              No communities found. Be the first to start one!
            </div>
          ) : (
            communities.map((community) => (
              <Link href={`/communities/${community.id}`} key={community.id} className="group block">
                <div className="bg-white border border-[#eee7dc] hover:border-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl season-story-ring p-[2px] shrink-0">
                      <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                        <Users size={20} className="text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-neutral-900 group-hover:text-primary transition-colors truncate">
                        {community.name}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-1 leading-relaxed">{community.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div className="hidden sm:block">
                      <div className="text-xs font-bold text-neutral-900">{community.member_count}</div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Members</div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

