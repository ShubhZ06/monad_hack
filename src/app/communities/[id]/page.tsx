'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';
import { Users, Calendar, DollarSign, Lock, Clock, ThumbsUp, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

// Re-using mock events for visualization until real events are created
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Rooftop Movie Night',
    organizer: 'NYU Film Club',
    state: 'PLEDGING', 
    price: '0.1',
    currency: 'MON',
    targetHeadcount: 100,
    currentPledges: 82,
    date: 'Oct 15, 2026',
    timeRemaining: '12 hours left',
    description: 'We secured the Sunset Lounge rooftop. Price includes projector rental, seating, and 1 drink ticket.',
    commentsCount: 14
  },
  {
    id: '2',
    title: 'Weekend Paintball Trip',
    organizer: 'Pending Organizer',
    state: 'INTEREST',
    price: '~0.5', 
    currency: 'MON',
    targetHeadcount: 40,
    currentInterest: 28,
    date: 'Nov 5, 2026',
    timeRemaining: 'Gathering Interest',
    description: 'Looking to rent out the entire warehouse at Urban Paintball. Need 40 people to make it cheap. Hit I\'m in if you want this to happen.',
    commentsCount: 4
  }
];

export default function CommunityHub() {
  const params = useParams();
  const communityId = params.id as string;
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const res = await fetch('/api/communities');
        const data = await res.json();
        const found = data.communities?.find((c: Community) => c.id === communityId);
        if (found) setCommunity(found);
      } catch (e) {
        console.error("Failed to fetch community", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, [communityId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center animate-pulse">Loading Hub...</div>;
  if (!community) return <div className="min-h-screen bg-background flex items-center justify-center">Community not found.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <main className="max-w-3xl mx-auto px-6 pt-6">
        <Link href="/communities" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-bold mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        {/* Community Header */}
        <header className="mb-12 border-b border-border pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-background border border-primary/30 flex items-center justify-center">
              <Users size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{community.name}</h1>
              <div className="text-sm font-bold text-primary mt-1">{community.member_count} Members</div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg mb-6">{community.description}</p>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform w-full sm:w-auto">
            + New Request
          </button>
        </header>

        {/* Event Requests Feed */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold mb-2">Active Requests</h2>
          
          {MOCK_EVENTS.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id} className="group block">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors flex flex-col relative overflow-hidden">
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  {event.state === 'PLEDGING' && (
                    <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      PLEDGING LIVE
                    </span>
                  )}
                  {event.state === 'INTEREST' && (
                    <span className="bg-secondary text-secondary-foreground border border-border px-3 py-1 rounded-full text-xs font-bold">
                      GATHERING INTEREST
                    </span>
                  )}
                </div>

                <div className="mb-4 pr-32">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="text-primary"><Calendar size={20} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Date</div>
                      <div className="font-medium text-sm">{event.date}</div>
                    </div>
                  </div>
                  
                  <div className="bg-background border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="text-primary"><DollarSign size={20} /></div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Price</div>
                      <div className="font-medium text-sm">{event.price} {event.currency}</div>
                    </div>
                  </div>
                </div>

                {/* Footer with Comments */}
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle size={18} />
                    <span className="text-sm font-bold">{event.commentsCount} comments</span>
                  </div>
                  <div className="text-sm font-bold text-primary flex items-center gap-1">
                    <span>View Thread</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
