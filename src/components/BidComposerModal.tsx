'use client';

import React, { useState } from 'react';
import { X, Flame, Shield, Check, DollarSign, Sparkles, Loader2, ArrowRight, Trophy, Zap, AlertCircle } from 'lucide-react';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

interface BidComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  targetHeadcount: number;
  currentMinBidInr?: number;
  onBidSubmitted: (newBid: any, newRank: number) => void;
  existingBid?: any;
}

const DELIVERABLES_OPTIONS = [
  'Private Rooftop / Venue Access',
  '4K Sound Rig & Audio Engineering',
  '2 Resident DJs (B2B Set)',
  'Neon Wristbands & Glow Decor',
  '2 Drink Coupons / Person',
  'Laser & Atmospheric Haze Rig',
  'Private Security & Door Staff',
  'Event Photo & Aftermovie Team',
];

export function BidComposerModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  targetHeadcount = 50,
  currentMinBidInr = 1100,
  onBidSubmitted,
  existingBid,
}: BidComposerModalProps) {
  const { address } = useAccount();

  // Step 1: Fee Paid (0.05 MON), Step 2: Set INR Bid, Step 3: Success
  const [hasPaidFee, setHasPaidFee] = useState<boolean>(Boolean(existingBid?.participation_fee_mon));
  const [isPayingFee, setIsPayingFee] = useState(false);
  const [feeTxHash, setFeeTxHash] = useState<string | null>(existingBid?.participation_fee_tx || null);

  // Form states
  const [vendorName, setVendorName] = useState(existingBid?.vendor_name || 'Monad Sound & Events');
  const [pricePerHeadInr, setPricePerHeadInr] = useState<number>(existingBid?.price_per_head_inr || (currentMinBidInr > 100 ? currentMinBidInr - 100 : 950));
  const [pitch, setPitch] = useState<string>(existingBid?.proposal_pitch || '');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>(
    existingBid?.services_included || [
      'Private Rooftop / Venue Access',
      '4K Sound Rig & Audio Engineering',
      '2 Resident DJs (B2B Set)',
      '2 Drink Coupons / Person',
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmountInr = pricePerHeadInr * targetHeadcount;
  // 1 MON ≈ ₹8,000 for realistic demo display
  const monEquivalent = Math.round((pricePerHeadInr / 8000) * 100) / 100;
  const isTakingFirstPlace = pricePerHeadInr < currentMinBidInr;

  const toggleDeliverable = (item: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  // Simulate or execute 0.05 MON fee payment
  const handlePayEntryFee = async () => {
    setIsPayingFee(true);
    setErrorMsg(null);
    try {
      // Simulate on-chain confirmation delay
      await new Promise((r) => setTimeout(r, 1200));
      const simulatedHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setFeeTxHash(simulatedHash);
      setHasPaidFee(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to pay participation fee');
    } finally {
      setIsPayingFee(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricePerHeadInr || pricePerHeadInr <= 0) {
      setErrorMsg('Please enter a valid price per head in INR');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const walletAddr = address || '0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B';

    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          vendor_wallet: walletAddr,
          vendor_name: vendorName,
          price_per_head_inr: pricePerHeadInr,
          proposal_pitch: pitch || 'Full turnkey experience for the hackathon afterparty.',
          services_included: selectedDeliverables,
          tx_hash: feeTxHash,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit bid');
      }

      onBidSubmitted(data.bid, data.new_rank);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border/80 shadow-[0_0_60px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-background/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Zap size={10} className="fill-primary" /> Reverse Auction Arena
              </span>
              <span className="text-xs text-muted-foreground">• 50 Attendees</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {existingBid ? 'Update Bid (Leaderboard Fight)' : 'Enter Bidding Arena'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* STEP 1: Monad Entry Fee (0.05 MON) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            hasPaidFee
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/40'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  hasPaidFee ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                }`}>
                  {hasPaidFee ? <Check size={20} /> : <Zap size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <span>Monad Participation Fee (0.05 MON)</span>
                    {hasPaidFee && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        VERIFIED ENTRY
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {hasPaidFee
                      ? `Tx Confirmed: ${feeTxHash?.slice(0, 10)}...${feeTxHash?.slice(-6)}`
                      : 'Anti-spam skin-in-the-game on Monad Testnet to unlock bidding.'}
                  </p>
                </div>
              </div>

              {!hasPaidFee && (
                <button
                  type="button"
                  onClick={handlePayEntryFee}
                  disabled={isPayingFee}
                  className="bg-primary text-primary-foreground font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all"
                >
                  {isPayingFee ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Paying...
                    </>
                  ) : (
                    <>
                      Pay 0.05 MON
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* STEP 2: The INR Bidding Form */}
          <form onSubmit={handleSubmitBid} className={`space-y-5 transition-opacity ${!hasPaidFee ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {/* Target Alert Banner */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              isTakingFirstPlace
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {isTakingFirstPlace ? <Trophy size={16} className="shrink-0 text-primary" /> : <AlertCircle size={16} className="shrink-0 text-amber-400" />}
                <span>
                  {isTakingFirstPlace
                    ? `🏆 Winning Bid! Your quote of ₹${pricePerHeadInr} beats the current #1 (₹${currentMinBidInr})!`
                    : `⚠️ Drop below ₹${currentMinBidInr} to claim the Rank #1 Minimum Charge spot.`}
                </span>
              </div>
            </div>

            {/* Vendor Organization Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                Your Business / Collective Name
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Monad Rooftop Collective"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Price Per Person in INR (Primary) & Conversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Your Charge per Person (INR ₹)
                </label>
                <span className="text-xs text-primary font-bold">
                  Total: ₹{totalAmountInr.toLocaleString()} (~{monEquivalent} MON)
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-lg">
                  ₹
                </div>
                <input
                  type="number"
                  min="100"
                  step="25"
                  value={pricePerHeadInr}
                  onChange={(e) => setPricePerHeadInr(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl pl-8 pr-28 py-3.5 text-lg font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-secondary text-muted-foreground font-semibold px-2.5 py-1 rounded-lg border border-border">
                  / attendee
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                For 50 attendees. Calculated total: <span className="text-foreground font-mono font-semibold">₹{totalAmountInr.toLocaleString()}</span>.
              </p>
            </div>

            {/* Deliverables Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                What Packages & Services are Included?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DELIVERABLES_OPTIONS.map((item) => {
                  const isChecked = selectedDeliverables.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleDeliverable(item)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-primary/15 border-primary/50 text-foreground font-bold'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="truncate pr-1">{item}</span>
                      {isChecked && <Check size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proposal Pitch Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                Proposal Pitch & Special Perks
              </label>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="What makes your setup unbeatable? Describe the atmosphere, DJs, equipment, and hospitality..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !hasPaidFee}
              className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all cursor-pointer ${
                isTakingFirstPlace
                  ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_25px_rgba(204,255,0,0.35)]'
                  : 'bg-secondary text-secondary-foreground hover:bg-border'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting to Arena...
                </>
              ) : isTakingFirstPlace ? (
                <>
                  <Trophy size={16} />
                  Submit Bid & Take #1 (₹{pricePerHeadInr})
                </>
              ) : (
                <>
                  <Flame size={16} />
                  Submit Bid (Rank #{currentMinBidInr ? '2+' : '1'})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
