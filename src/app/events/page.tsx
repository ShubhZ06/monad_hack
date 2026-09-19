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
    price: '0.1',
    currency: 'MON',
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
    price: '0.1',
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
    price: '~0.5', // Indicative
    currency: 'MON',
    targetHeadcount: 40,
    currentInterest: 28,
    date: 'Nov 5, 2026',
    timeRemaining: 'Gathering Interest',
    description: 'Looking to rent out the entire warehouse at Urban Paintball. Need 40 people to make it cheap. Hit I\'m in if you want this to happen.',
  }
];

export default function EventsDashboard() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-28">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee7dc] text-[11px] font-semibold text-neutral-600 mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Monad Escrow Smart Contracts
            </div>
            <h1 className="font-display italic font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
              Community <span className="text-primary not-italic">Trips & Requests</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl leading-relaxed">
              Vote with your wallet. Propose group events, aggregate demand, and pledge funds securely into on-chain smart contract escrow.
            </p>
          </div>
          <button className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer">
            + Propose Trip
          </button>
        </header>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
          {EVENTS.map((event) => (
            <div key={event.id} className="bg-white border border-[#eee7dc] rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-primary/40 transition-all flex flex-col relative shadow-sm">
              
              {/* Status Badge */}
              <div className="absolute top-5 right-5">
                {event.state === 'PLEDGING' && (
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                    PLEDGING LIVE
                  </span>
                )}
                {event.state === 'LOCKED' && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Lock size={11} /> ESCROW LOCKED
                  </span>
                )}
                {event.state === 'INTEREST' && (
                  <span className="bg-[#f4f0e8] text-neutral-600 border border-[#eee7dc] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                    GATHERING INTEREST
                  </span>
                )}
              </div>

              <div className="mb-4 pr-24">
                <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900 mb-1">{event.title}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="text-primary"><Calendar size={16} /></div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date</div>
                    <div className="font-semibold text-xs text-neutral-800">{event.date}</div>
                  </div>
                </div>
                
                <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                  <div className="text-primary"><DollarSign size={16} /></div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Price</div>
                    <div className="font-semibold text-xs text-neutral-800">{event.price} {event.currency}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-auto pt-4 border-t border-[#f4f0e8]">
                {event.state === 'PLEDGING' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="font-bold text-neutral-800">{event.currentPledges} Pledged</span>
                      <span className="text-neutral-400">Goal: {event.targetHeadcount}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${((event.currentPledges || 0) / event.targetHeadcount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2.5 items-center">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm">
                          Pledge {event.price} {event.currency}
                        </button>
                      </Link>
                      <button className="p-2.5 border border-[#eee7dc] hover:bg-neutral-50 rounded-full text-neutral-600 transition-colors cursor-pointer">
                        <Clock size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {event.state === 'LOCKED' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-600">Threshold Reached</div>
                      <div className="text-[11px] text-neutral-400">{event.currentPledges} participants ready</div>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <button className="bg-[#f4f0e8] hover:bg-[#eee7dc] text-neutral-800 border border-[#eee7dc] font-semibold px-4 py-2 rounded-full text-xs transition-colors cursor-pointer">
                        View Trip
                      </button>
                    </Link>
                  </div>
                )}

                {event.state === 'INTEREST' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="font-bold text-neutral-800">{event.currentInterest} People Interested</span>
                      <span className="text-neutral-400">Target: {event.targetHeadcount}</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div 
                        className="bg-neutral-400 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${((event.currentInterest || 0) / event.targetHeadcount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2.5 items-center">
                      <button className="flex-1 bg-white border border-[#eee7dc] hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                        <ThumbsUp size={14} className="text-primary" />
                        <span>Count Me In</span>
                      </button>
                      <Link href={`/events/${event.id}`}>
                        <button className="px-4 py-2.5 bg-[#f4f0e8] hover:bg-[#eee7dc] text-neutral-800 border border-[#eee7dc] font-semibold rounded-full text-xs transition-colors cursor-pointer">
                          Details
                        </button>
                      </Link>
                    </div>
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
