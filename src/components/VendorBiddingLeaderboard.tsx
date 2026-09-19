'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  ArrowUpDown,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  RefreshCw,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { VendorBid } from '@/lib/bidsData';
import { BidComposerModal } from './BidComposerModal';

interface VendorBiddingLeaderboardProps {
  eventId: string;
  eventTitle: string;
  targetHeadcount?: number;
  indicativePriceInr?: number;
}

export function VendorBiddingLeaderboard({
  eventId,
  eventTitle,
  targetHeadcount = 50,
  indicativePriceInr = 1500,
}: VendorBiddingLeaderboardProps) {
  const { address, isConnected } = useAccount();

  const [bids, setBids] = useState<VendorBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rules'>('leaderboard');
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      const res = await fetch(`/api/bids?event_id=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [eventId]);

  const leader = bids[0] || null;
  const lowestCharge = leader?.price_per_head_inr || indicativePriceInr;
  const userBid = bids.find(
    (b) => address && b.vendor_wallet.toLowerCase() === address.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider mb-2">
              <Trophy size={11} className="text-emerald-600" /> Reverse Auction • Lowest Price Wins
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
              Vendor Bidding Arena
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl leading-relaxed">
              Full community quorum met! Verified vendors compete for the organizer contract. The lowest quote per head takes <strong className="text-neutral-900">Rank #1</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => fetchBids()}
              className="p-2.5 rounded-full border border-[#eee7dc] hover:bg-neutral-50 text-neutral-600 transition-colors"
              title="Refresh Leaderboard"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 py-2.5 rounded-full text-xs transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Flame size={14} className="text-amber-400" />
              <span>{userBid ? 'Update / Undercut Bid' : 'Enter Arena & Bid'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rank #1 Champion Spotlight */}
      {leader && (
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/5 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#eee7dc]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                #1
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  <Award size={12} className="text-emerald-600" /> Current Winning Proposal
                </div>
                <h3 className="font-display font-bold text-xl text-neutral-900">{leader.vendor_name}</h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Minimum Charge</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                ₹{leader.price_per_head_inr.toLocaleString()}
                <span className="text-xs font-normal text-neutral-500"> / person</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Total: ₹{leader.total_amount_inr.toLocaleString()} (~{leader.mon_equivalent} MON)
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-600 my-4 leading-relaxed italic">
            &ldquo;{leader.proposal_pitch}&rdquo;
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {leader.services_included.map((srv, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800"
              >
                ✓ {srv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white border border-[#eee7dc] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-neutral-900">
            Live Competitor Board ({bids.length} Bids)
          </h3>
          <span className="text-xs text-neutral-400">Sorted by lowest charge</span>
        </div>

        <div className="divide-y divide-[#f4f0e8]">
          {bids.map((b, idx) => {
            const rank = idx + 1;
            const isRank1 = rank === 1;
            const isUser = address && b.vendor_wallet.toLowerCase() === address.toLowerCase();

            return (
              <div
                key={b.id}
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isRank1 ? 'bg-emerald-50/40 -mx-3 px-3 rounded-2xl' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isRank1
                        ? 'bg-emerald-600 text-white font-black'
                        : rank === 2
                        ? 'bg-neutral-200 text-neutral-800'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    #{rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">{b.vendor_name}</span>
                      {isUser && (
                        <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                      {b.status === 'OUTBID' && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                          OUTBID
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {b.vendor_wallet.slice(0, 6)}...{b.vendor_wallet.slice(-4)} • Rev #{b.revision_count}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-black text-neutral-900">
                      ₹{b.price_per_head_inr.toLocaleString()}
                      <span className="text-[11px] font-normal text-neutral-400"> / hd</span>
                    </div>
                    {!isRank1 && leader && (
                      <div className="text-[10px] text-amber-600 font-semibold">
                        +₹{b.price_per_head_inr - leader.price_per_head_inr} vs #1
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f4f0e8] hover:bg-[#eee7dc] text-neutral-800 transition-colors cursor-pointer"
                  >
                    Undercut
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bid Composer Modal */}
      <BidComposerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        targetHeadcount={targetHeadcount}
        currentMinChargeInr={lowestCharge}
        onBidSubmitted={() => fetchBids()}
      />
    </div>
  );
}
