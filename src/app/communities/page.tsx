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
    <div className="min-h-screen bg-background text-foreground pb-24">


      <main className="max-w-3xl mx-auto px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Find your <span className="text-primary">Tribe</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Join a community to see exclusive event requests, chat with members, and pledge together.
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search universities, cities, or clubs..." 
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Community List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-10 animate-pulse">Loading communities...</div>
          ) : communities.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No communities found. Create one!</div>
          ) : (
            communities.map((community) => (
              <Link href={`/communities/${community.id}`} key={community.id} className="group block">
                <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all flex items-center justify-between gap-4 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 to-background border border-primary/30 flex items-center justify-center">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{community.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{community.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="text-sm font-bold">{community.member_count}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Members</div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
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
