import { WalletButton } from '@/components/WalletButton';
import { Calendar, Users, DollarSign, Lock, Clock, ThumbsUp } from 'lucide-react';
import Link from 'next/link';

// Mock data to visualize the different states of the Escrow Loop
const EVENTS = [
  {
    id: '1',
    title: 'Rooftop Movie Night',
    organizer: 'NYU Film Club',
    state: 'PLEDGING', // Draft -> Interest -> Bidding -> Voting -> Pledging -> Locked
    price: '500',
    currency: 'USDC',
    targetHeadcount: 100,
    currentPledges: 82,
    date: 'Oct 15, 2026',
    timeRemaining: '12 hours left',
    description: 'We secured the Sunset Lounge rooftop. Price includes projector rental, seating, and 1 drink ticket.',
  },
  {
    id: '2',
    title: 'Hackathon Afterparty',
    organizer: 'Monad Builders',
    state: 'LOCKED',
    price: '15',
    currency: 'MON',
    targetHeadcount: 50,
    currentPledges: 55,
    date: 'Oct 2, 2026',
    timeRemaining: 'Threshold Met',
    description: 'Venue is booked! Escrow is locked and the upfront tranche has been released to the organizer.',
  },
  {
    id: '3',
    title: 'Weekend Paintball Trip',
    organizer: 'Pending Organizer',
    state: 'INTEREST',
    price: '~800', // Indicative
    currency: 'USDC',
    targetHeadcount: 40,
    currentInterest: 28,
    date: 'Nov 5, 2026',
    timeRemaining: 'Gathering Interest',
    description: 'Looking to rent out the entire warehouse at Urban Paintball. Need 40 people to make it cheap. Hit I\'m in if you want this to happen.',
  }
];

export default function EventsDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-tighter">
            MONAD<span className="text-primary">.PWA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Discovery Feed
            </Link>
            <WalletButton className="!px-4 !py-2 !text-sm !rounded-lg !shadow-none" showIcon={false} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Community <span className="text-primary">Requests</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Vote with your wallet. Propose ideas, gather interest, and pledge to make them happen trustlessly.
            </p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform whitespace-nowrap">
            + New Request
          </button>
        </header>

        {/* Events Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {EVENTS.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors flex flex-col relative overflow-hidden">
              
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                {event.state === 'PLEDGING' && (
                  <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    PLEDGING LIVE
                  </span>
                )}
                {event.state === 'LOCKED' && (
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock size={12} /> ESCROW LOCKED
                  </span>
                )}
                {event.state === 'INTEREST' && (
                  <span className="bg-secondary text-secondary-foreground border border-border px-3 py-1 rounded-full text-xs font-bold">
                    GATHERING INTEREST
                  </span>
                )}
              </div>

              <div className="mb-4 pr-32">
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
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

              {/* Progress Bar & Actions */}
              <div className="mt-auto pt-4 border-t border-border">
                
                {event.state === 'PLEDGING' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span>{event.currentPledges} Pledged</span>
                      <span className="text-muted-foreground">Goal: {event.targetHeadcount}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 mb-4 overflow-hidden border border-border">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${((event.currentPledges || 0) / event.targetHeadcount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                        Pledge {event.price} {event.currency}
                      </button>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 bg-background px-3 py-3 rounded-xl border border-border">
                        <Clock size={14} /> {event.timeRemaining}
                      </div>
                    </div>
                  </div>
                )}

                {event.state === 'LOCKED' && (
                  <div>
                     <div className="flex justify-between text-sm mb-4 font-medium text-green-400">
                      <span>{event.currentPledges} Final Headcount</span>
                      <span>100% Funded</span>
                    </div>
                    <button className="w-full bg-secondary text-muted-foreground font-bold py-3 rounded-xl cursor-not-allowed">
                      Event is Locked & Funded
                    </button>
                  </div>
                )}

                {event.state === 'INTEREST' && (
                  <div>
                    <div className="flex justify-between text-sm mb-4 font-medium">
                      <span className="text-primary">{event.currentInterest} Interested</span>
                      <span className="text-muted-foreground">Needs 40 to open bidding</span>
                    </div>
                    <button className="w-full bg-accent text-accent-foreground border border-border hover:border-primary font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                      <ThumbsUp size={18} /> I&apos;m in!
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
