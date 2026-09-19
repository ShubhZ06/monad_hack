'use client';

import { Calendar, Users, DollarSign, Lock, Clock, ThumbsUp, Shield, ExternalLink, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ESCROW_ADDRESS, ESCROW_ABI } from '@/config/contracts';

export default function EventsDashboard() {
  // Read real on-chain event (ID 0) from the EventEscrow contract on Monad Testnet
  const { data: onchainEvent0, isLoading: isLoadingOnchain } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'events',
    args: [BigInt(0)],
  });

  // Derived real on-chain values
  const onchainCurrentPledges = onchainEvent0 ? Number(onchainEvent0[2]) : 1;
  const onchainTargetGoal = onchainEvent0 ? Number(onchainEvent0[1]) : 40;
  const onchainPriceRaw = onchainEvent0 ? onchainEvent0[3] : BigInt(50000000);
  const onchainPriceFormatted = formatUnits(onchainPriceRaw, 6); // 50 USDC
  const onchainStateNum = onchainEvent0 ? Number(onchainEvent0[5]) : 1;
  const isOnchainLocked = onchainStateNum === 2 || onchainCurrentPledges >= onchainTargetGoal;
  const onchainProgress = onchainTargetGoal > 0 ? (onchainCurrentPledges / onchainTargetGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-28">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee7dc] text-[11px] font-semibold text-neutral-600 mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Monad Testnet Escrow Contract (Chain ID: 10143)
            </div>
            <h1 className="font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
              Community <span className="text-primary">Trips & Requests</span>
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
          
          {/* Real On-Chain Event 0: Rooftop Movie Night */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-emerald-500/50 transition-all flex flex-col relative shadow-sm">
            
            {/* Live On-Chain Badge */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <Shield size={11} className="text-emerald-600" />
                {isOnchainLocked ? 'ESCROW LOCKED' : 'ON-CHAIN LIVE'}
              </span>
            </div>

            <div className="mb-4 pr-32">
              <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles size={11} /> Smart Contract Event #0
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900 mb-1">Rooftop Movie Night</h3>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                We secured the Sunset Lounge rooftop. Price includes projector rental, seating, and 1 drink ticket. Pledges held in on-chain escrow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-primary"><Calendar size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date</div>
                  <div className="font-semibold text-xs text-neutral-800">Oct 15, 2026</div>
                </div>
              </div>
              
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-emerald-600"><DollarSign size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Price / Head</div>
                  <div className="font-semibold text-xs text-neutral-800">{onchainPriceFormatted} USDC</div>
                </div>
              </div>
            </div>

            {/* Progress Bar & Actions */}
            <div className="mt-auto pt-4 border-t border-[#f4f0e8]">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isLoadingOnchain ? 'Loading chain...' : `${onchainCurrentPledges} Pledged On-Chain`}
                </span>
                <span className="text-neutral-500 font-semibold">Goal: {onchainTargetGoal}</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-4 overflow-hidden border border-neutral-200/50">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(onchainProgress, 100)}%` }}
                ></div>
              </div>

              <div className="flex gap-2.5 items-center">
                <Link href="/events/0" className="flex-1">
                  <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                    <span>Pledge {onchainPriceFormatted} USDC on Monad</span>
                  </button>
                </Link>
                <a
                  href={`https://testnet.monadexplorer.com/address/${ESCROW_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 border border-[#eee7dc] hover:bg-neutral-50 rounded-full text-neutral-600 transition-colors cursor-pointer"
                  title="View Smart Contract on Monad Explorer"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Event 2: Hackathon Afterparty & Vendor Bidding Arena */}
          <div className="bg-white border-2 border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-emerald-500/50 transition-all flex flex-col relative shadow-sm">
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <Shield size={11} className="text-emerald-600" />
                BIDDING LIVE
              </span>
            </div>

            <div className="mb-4 pr-32">
              <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles size={11} /> 100% Voted • Reverse Auction
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900 mb-1">Neon Nights Hackathon Rave</h3>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                Full quorum reached! 50 builders locked in. Verified vendors are currently competing to organize this event for the lowest charge.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-primary"><Calendar size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date</div>
                  <div className="font-semibold text-xs text-neutral-800">Oct 24, 2026</div>
                </div>
              </div>
              
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-emerald-600"><DollarSign size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Lowest Bid</div>
                  <div className="font-semibold text-xs text-neutral-800">₹1,100 / head</div>
                </div>
              </div>
            </div>

            {/* Progress Bar & Actions */}
            <div className="mt-auto pt-4 border-t border-[#f4f0e8]">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  3 Competing Bids (Rank #1: ₹1,100)
                </span>
                <span className="text-neutral-500 font-semibold">Quorum: 50 / 50</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-4 overflow-hidden border border-neutral-200/50">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full w-full transition-all duration-1000" 
                ></div>
              </div>

              <div className="flex gap-2.5 items-center">
                <Link href="/events/event-neon-nights-bidding" className="flex-1">
                  <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                    <span>Enter Bidding Arena (Lowest Charge Wins)</span>
                  </button>
                </Link>
                <Link
                  href="/events/event-neon-nights-bidding"
                  className="p-2.5 border border-[#eee7dc] hover:bg-neutral-50 rounded-full text-neutral-600 transition-colors cursor-pointer"
                  title="View Bidding Arena Leaderboard"
                >
                  <Trophy size={14} className="text-emerald-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Event 3: Weekend Paintball Trip (Gathering Interest) */}
          <div className="bg-white border border-[#eee7dc] rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-primary/40 transition-all flex flex-col relative shadow-sm">
            <div className="absolute top-5 right-5">
              <span className="bg-[#f4f0e8] text-neutral-600 border border-[#eee7dc] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                GATHERING INTEREST
              </span>
            </div>

            <div className="mb-4 pr-24">
              <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900 mb-1">Weekend Paintball Trip</h3>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                Looking to rent out the entire warehouse at Urban Paintball. Need 40 people to make it cheap. Hit I&apos;m in if you want this to happen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-primary"><Calendar size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Date</div>
                  <div className="font-semibold text-xs text-neutral-800">Nov 5, 2026</div>
                </div>
              </div>
              
              <div className="bg-[#fbf9f5] border border-[#eee7dc] rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="text-primary"><DollarSign size={16} /></div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Est. Price</div>
                  <div className="font-semibold text-xs text-neutral-800">~25 USDC</div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#f4f0e8]">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="font-bold text-neutral-800">28 People Interested</span>
                <span className="text-neutral-400">Target: 40</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-neutral-400 h-2 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
              </div>
              <div className="flex gap-2.5 items-center">
                <button className="flex-1 bg-white border border-[#eee7dc] hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                  <ThumbsUp size={14} className="text-primary" />
                  <span>Count Me In</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

