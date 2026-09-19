'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Shield, Check, Flame, ChevronRight, ArrowDownRight, RefreshCw, UserCheck, Briefcase, Plus, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { BidComposerModal } from './BidComposerModal';
import { VendorBid } from '@/lib/bidsData';

interface VendorBiddingLeaderboardProps {
  eventId: string;
  eventTitle: string;
  targetHeadcount: number;
  initialBids?: VendorBid[];
  indicativePriceInr?: number;
}

export function VendorBiddingLeaderboard({
  eventId,
  eventTitle,
  targetHeadcount = 50,
  initialBids = [],
  indicativePriceInr = 1500,
}: VendorBiddingLeaderboardProps) {
  const { address, isConnected } = useAccount();

  const [bids, setBids] = useState<VendorBid[]>(initialBids);
  const [loading, setLoading] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isVendorRole, setIsVendorRole] = useState(true); // Default to vendor mode for easy demo testing
  const [highlightedBidId, setHighlightedBidId] = useState<string | null>(null);

  // Fetch bids from API
  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bids?event_id=${eventId}`);
      const data = await res.json();
      if (data.bids) {
        setBids(data.bids);
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

  const sortedBids = [...bids].sort((a, b) => a.price_per_head_inr - b.price_per_head_inr);
  const championBid = sortedBids[0] || null;
  const runnerUpBids = sortedBids.slice(1);

  const userExistingBid = address
    ? sortedBids.find(b => b.vendor_wallet.toLowerCase() === address.toLowerCase())
    : null;

  const handleBidSubmitted = (newBid: VendorBid, newRank: number) => {
    setHighlightedBidId(newBid.id);
    fetchBids();
    setTimeout(() => setHighlightedBidId(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Arena Header & Role Switcher */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-primary/20 text-primary border border-primary/40 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={12} className="fill-primary" /> Reverse Auction Arena
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                • 50/50 Votes Met • Entry Fee: 0.05 MON
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Vendor Bidding Leaderboard
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Vendors compete downward to deliver this 50-person afterparty. The vendor with the <strong className="text-primary font-bold">minimum charge</strong> sits at Rank #1.
            </p>
          </div>

          {/* Role Toggle for Demo Judges */}
          <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsVendorRole(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !isVendorRole
                  ? 'bg-secondary text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck size={14} /> Student View
            </button>
            <button
              onClick={() => setIsVendorRole(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isVendorRole
                  ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Briefcase size={14} /> Vendor Arena
            </button>
          </div>
        </div>

        {/* Live Arena Action Bar for Vendors */}
        {isVendorRole && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                <Flame size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>Leaderboard Fight Active</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                    {sortedBids.length} Competing Bids
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Current minimum to beat: <strong className="text-primary font-mono">₹{championBid?.price_per_head_inr ?? 1100} / person</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsComposerOpen(true)}
              className="bg-primary text-primary-foreground font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {userExistingBid ? (
                <>
                  <Zap size={14} className="fill-primary-foreground" />
                  Update Bid (Take #1)
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Enter Arena & Place Bid (0.05 MON)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RANK #1 CHAMPION SPOTLIGHT CARD */}
      {championBid && (
        <div className={`relative bg-card border-2 rounded-3xl p-6 overflow-hidden transition-all shadow-[0_0_50px_rgba(204,255,0,0.15)] ${
          highlightedBidId === championBid.id
            ? 'border-primary scale-[1.01] animate-pulse'
            : 'border-primary/60 hover:border-primary'
        }`}>
          {/* Rank #1 Crown Badge */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(204,255,0,0.4)]">
              <Trophy size={14} className="fill-primary-foreground" />
              <span>Rank #1 • Best Offer / Minimum Charge</span>
            </div>

            {championBid.revision_count > 1 && (
              <span className="text-[11px] font-mono text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-full flex items-center gap-1">
                <RefreshCw size={11} className="text-primary" />
                Fight Revision #{championBid.revision_count}
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Vendor Info & Pitch */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-foreground tracking-tight truncate">
                  {championBid.vendor_name}
                </h3>
                <span className="text-primary shrink-0" title="Verified Monad Vendor">
                  <Check size={18} className="p-0.5 bg-primary/20 text-primary rounded-full" />
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-mono mb-3 truncate">
                Wallet: {championBid.vendor_wallet.slice(0, 8)}...{championBid.vendor_wallet.slice(-6)} • 0.05 MON Fee Verified
              </p>

              <p className="text-sm text-foreground/90 bg-background/60 border border-border/80 rounded-2xl p-3.5 mb-4">
                &ldquo;{championBid.proposal_pitch}&rdquo;
              </p>

              {/* Package Deliverables Pills */}
              <div className="flex flex-wrap gap-1.5">
                {championBid.services_included?.map((service, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold bg-secondary/80 text-secondary-foreground border border-border px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Check size={11} className="text-primary shrink-0" />
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Minimum Charge Hero Box */}
            <div className="bg-background border border-primary/40 rounded-2xl p-5 shrink-0 flex flex-col items-center justify-center min-w-[240px] text-center shadow-[0_0_20px_rgba(204,255,0,0.08)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Minimum Charge
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-primary my-1">
                ₹{championBid.price_per_head_inr.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground font-bold mb-2">
                / attendee • Total: ₹{championBid.total_amount_inr.toLocaleString()}
              </div>
              <div className="text-[11px] font-mono bg-primary/15 text-primary px-3 py-1 rounded-full font-bold mb-4">
                ~{championBid.mon_equivalent} MON / head
              </div>

              <div className="w-full pt-3 border-t border-border flex justify-center text-xs text-green-400 font-bold">
                ↓ ₹{indicativePriceInr - championBid.price_per_head_inr} below initial budget!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPETING BIDS (RUNNERS UP) */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
          <span>Competing Vendor Bids ({runnerUpBids.length})</span>
          <span className="text-xs text-muted-foreground font-normal">Sorted lowest to highest</span>
        </h3>

        {runnerUpBids.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs bg-card border border-border rounded-2xl">
            No competing bids yet. Be the first to undercut Rank #1!
          </div>
        ) : (
          runnerUpBids.map((bid, index) => {
            const rank = index + 2;
            const diffInr = bid.price_per_head_inr - (championBid?.price_per_head_inr || 0);

            return (
              <div
                key={bid.id}
                className={`bg-card/70 border rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40 ${
                  highlightedBidId === bid.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                {/* Left: Rank & Vendor */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-secondary border border-border text-foreground font-mono font-black text-sm flex items-center justify-center shrink-0">
                    #{rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{bid.vendor_name}</h4>
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold uppercase">
                        OUTBID (+₹{diffInr})
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {bid.proposal_pitch}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {bid.services_included?.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                          {s}
                        </span>
                      ))}
                      {(bid.services_included?.length || 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(bid.services_included?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Outbid Delta */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-right">
                    <div className="font-mono font-black text-lg text-foreground">
                      ₹{bid.price_per_head_inr.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Total: ₹{bid.total_amount_inr.toLocaleString()} (~{bid.mon_equivalent} MON)
                    </div>
                  </div>

                  {isVendorRole && (
                    <button
                      onClick={() => setIsComposerOpen(true)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      Undercut <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bidding Modal */}
      <BidComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        targetHeadcount={targetHeadcount}
        currentMinBidInr={championBid?.price_per_head_inr || 1100}
        onBidSubmitted={handleBidSubmitted}
        existingBid={userExistingBid}
      />
    </div>
  );
}
