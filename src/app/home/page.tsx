import { WalletButton } from '@/components/WalletButton';
import { Flame, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Mock data for venues to visualize the Discovery Feed
const VENUES = [
  {
    id: '1',
    name: 'Neon Nights Rooftop',
    type: 'Lounge & Bar',
    vibe: 'Insane',
    image: 'https://images.unsplash.com/photo-1572116469696-31de29b20e0d?q=80&w=800&auto=format&fit=crop',
    reviews: 142,
  },
  {
    id: '2',
    name: 'The Concrete Jungle',
    type: 'Underground Club',
    vibe: 'Worth it',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    reviews: 89,
  },
  {
    id: '3',
    name: 'Monad Cafe & Roastery',
    type: 'Cafe & Workspace',
    vibe: 'Insane',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    reviews: 215,
  },
  {
    id: '4',
    name: 'Sunset Bowling Alley',
    type: 'Activity',
    vibe: 'Mid',
    image: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=800&auto=format&fit=crop',
    reviews: 45,
  },
];

export default function DiscoveryFeed() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">


      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Discover the <span className="text-primary">Vibe</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Real ratings from real check-ins. Browse trusted venues and propose group trips with your community.
          </p>
        </header>

        {/* Filters (Visual only for MVP) */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap">
            <Flame size={16} /> Trending
          </button>
          <button className="bg-card border border-border px-4 py-2 rounded-full text-sm font-medium hover:bg-border transition-colors whitespace-nowrap">
            Clubs & Lounges
          </button>
          <button className="bg-card border border-border px-4 py-2 rounded-full text-sm font-medium hover:bg-border transition-colors whitespace-nowrap">
            Cafes
          </button>
          <button className="bg-card border border-border px-4 py-2 rounded-full text-sm font-medium hover:bg-border transition-colors whitespace-nowrap">
            Activities
          </button>
        </div>

        {/* Venue Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {VENUES.map((venue) => (
            <div key={venue.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col">
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-muted">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-border flex items-center gap-1">
                  {venue.vibe === 'Insane' && <Flame size={14} className="text-orange-500" />}
                  {venue.vibe === 'Worth it' && <Sparkles size={14} className="text-primary" />}
                  Vibe: <span className={venue.vibe === 'Insane' ? 'text-primary' : ''}>{venue.vibe}</span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold line-clamp-1">{venue.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
                  <MapPin size={14} />
                  <span>{venue.type} • {venue.reviews} verified visits</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border">
                  <Link href="/events" className="w-full block">
                    <button className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-xl transition-colors">
                      Propose a Trip Here
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
