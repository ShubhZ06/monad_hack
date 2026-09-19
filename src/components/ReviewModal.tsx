'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, Upload, X, Camera, Sparkles, Flame, CheckCircle2, Gift, ExternalLink, Loader2, Copy, Check, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { VenueSimple } from './CheckInPeekingWidget';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueSimple;
  onReviewSubmitted: (newReview: any, coupon: any) => void;
  onOpenCoupons: () => void;
  existingReview?: {
    rating?: number | null;
    vibe_tag?: string | null;
    comment?: string | null;
    image_url?: string | null;
  } | null;
  alreadyClaimedCoupon?: boolean;
  userLat?: number | null;
  userLng?: number | null;
  isSimulatedAtVenue?: boolean;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const VIBE_TAGS = [
  { label: 'Insane', icon: Flame, color: 'text-orange-500' },
  { label: 'Worth it', icon: Sparkles, color: 'text-primary' },
  { label: 'Chill', icon: null, color: 'text-blue-400' },
  { label: 'Aesthetic', icon: Camera, color: 'text-pink-400' },
  { label: 'Mid', icon: null, color: 'text-muted-foreground' },
  { label: 'Loud', icon: null, color: 'text-yellow-400' },
];

const PHOTO_PRESETS = [
  {
    name: 'Latte Art',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Matcha & Croissant',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Aesthetic Interior',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
  },
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Mid 😐',
  2: 'Decent 👍',
  3: 'Worth it ✨',
  4: 'Fire 🔥',
  5: 'Insane! 🚀',
};

export function ReviewModal({
  isOpen,
  onClose,
  venue,
  onReviewSubmitted,
  onOpenCoupons,
  existingReview,
  alreadyClaimedCoupon = false,
  userLat,
  userLng,
  isSimulatedAtVenue = false,
}: ReviewModalProps) {
  const { address } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [vibeTag, setVibeTag] = useState<string>(existingReview?.vibe_tag || 'Insane');
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [imageUrl, setImageUrl] = useState<string>(
    existingReview?.image_url || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ review: any; coupon: any; already_claimed?: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when existingReview changes
  useEffect(() => {
    if (existingReview) {
      if (existingReview.rating) setRating(existingReview.rating);
      if (existingReview.vibe_tag) setVibeTag(existingReview.vibe_tag);
      if (existingReview.comment) setComment(existingReview.comment);
      if (existingReview.image_url) setImageUrl(existingReview.image_url);
    }
  }, [existingReview]);

  if (!isOpen) return null;

  const walletAddr = address || '0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B';
  const isEditing = Boolean(existingReview || alreadyClaimedCoupon);

  // Distance & Location Verification (250m radius)
  let distanceMeters: number | null = null;
  let isWithinRange = true;

  if (isSimulatedAtVenue) {
    distanceMeters = 24; // Simulated in-venue presence
    isWithinRange = true;
  } else if (userLat && userLng) {
    const isMonadCafe = venue.id === 'venue-monad-cafe' || venue.name.toLowerCase().includes('monad cafe');
    const venueLat = isMonadCafe ? userLat : (venue.latitude ?? (userLat + 0.016));
    const venueLng = isMonadCafe ? userLng : (venue.longitude ?? (userLng + 0.014));
    const dKm = haversineDistance(userLat, userLng, venueLat, venueLng);
    distanceMeters = Math.round(dKm * 1000);
    isWithinRange = distanceMeters <= 250;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please share a few words about your experience');
      return;
    }

    if (!isWithinRange) {
      setErrorMsg(`Proof of Location Failed: You are outside the 250m check-in radius for ${venue.name}. You cannot review from outside.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        venue_id: venue.id,
        venue_name: venue.name,
        wallet_address: walletAddr,
        rating,
        vibe_tag: vibeTag,
        comment,
        image_url: imageUrl,
        user_lat: isSimulatedAtVenue ? venue.latitude : userLat,
        user_lng: isSimulatedAtVenue ? venue.longitude : userLng,
        is_simulated: isSimulatedAtVenue,
      };

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccessData(data);
      onReviewSubmitted(data.review, data.coupon);
    } catch (err: any) {
      console.error('Review submit error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase font-mono font-bold text-green-400">At Venue</span>
              </div>
              <h3 className="font-bold text-base text-foreground truncate">{venue.name}</h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin flex-1">
          {successData ? (
            /* SUCCESS REWARD SCREEN */
            <div className="py-4 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  {successData.coupon ? 'Review Posted & NFT Claimed! 🎉' : 'Review Updated! ✨'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {successData.coupon
                    ? 'Your review is live on the discovery feed and your Monad NFT coupon is ready.'
                    : 'Your review has been updated. (Limit: 1 discount coupon per venue to prevent farming).'}
                </p>
              </div>

              {/* Claimed Monad NFT Coupon Card (Only if new coupon issued) */}
              {successData.coupon ? (
                <div className="w-full bg-gradient-to-b from-primary/15 via-card to-background border-2 border-primary/50 rounded-2xl p-5 text-left relative overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                      Monad Testnet NFT #{successData.coupon.token_id}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Gift size={12} className="text-primary" /> Verified Reward
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-foreground mb-1">
                    {successData.coupon.discount_title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Valid for all food & beverages at <span className="text-foreground font-semibold">{venue.name}</span>
                  </p>

                  {/* Coupon Voucher Code Box */}
                  <div className="bg-background/90 border border-dashed border-primary/60 rounded-xl p-3 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block">Voucher Code</span>
                      <span className="font-mono font-bold text-base text-primary tracking-widest">
                        {successData.coupon.discount_code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(successData.coupon.discount_code)}
                      className="bg-secondary hover:bg-primary hover:text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      {copiedCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* On-Chain Explorer Link */}
                  {successData.coupon.monad_tx_hash && (
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${successData.coupon.monad_tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 font-mono transition-colors"
                    >
                      <span>Tx: {successData.coupon.monad_tx_hash.slice(0, 10)}...{successData.coupon.monad_tx_hash.slice(-8)}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ) : (
                /* Already claimed banner (anti-farming info) */
                <div className="w-full bg-secondary/80 border border-border rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <CheckCircle2 size={16} /> 1 NFT Coupon Per Venue Rule
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You already have a valid Monad 20% discount coupon in your wallet for <span className="text-foreground font-semibold">{venue.name}</span>. Duplicate coupon minting is prevented to protect venue partners.
                  </p>
                </div>
              )}

              {/* Post Success Actions */}
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="flex-1 bg-secondary hover:bg-border text-secondary-foreground font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  Back to Discovery
                </button>
                <button
                  onClick={() => {
                    handleResetAndClose();
                    onOpenCoupons();
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:brightness-110 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
                >
                  <Gift size={16} />
                  View in My Coupons
                </button>
              </div>
            </div>
          ) : (
            /* REVIEW COMPOSER FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anti-Farming Rule Callout if editing/already claimed */}
              {isEditing && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-300">
                  <ShieldAlert size={16} className="shrink-0 text-amber-400" />
                  <span>
                    You already reviewed this venue. Submitting will update your review. (Limit: 1 coupon per venue to prevent coupon farming).
                  </span>
                </div>
              )}

              {/* Proof of Location Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isWithinRange
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              }`}>
                <div className="flex items-center gap-2">
                  {isWithinRange ? (
                    <ShieldCheck size={16} className="text-green-400 shrink-0" />
                  ) : (
                    <ShieldAlert size={16} className="text-destructive shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {isWithinRange ? 'Proof of Location: Verified Inside' : 'Location Gate: Outside Venue'}
                    </span>
                    <span className="text-[10px] opacity-85">
                      {isWithinRange
                        ? `Within ${venue.name} check-in boundary (${distanceMeters ?? 24}m, max 250m)`
                        : `You are ${distanceMeters ? distanceMeters + 'm' : 'too far'} away. You cannot review from outside.`}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  isWithinRange ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'
                }`}>
                  {isWithinRange ? 'Eligible' : 'Blocked'}
                </span>
              </div>

              {/* Star Rating Section */}
              <div className="text-center space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={`${
                            active
                              ? 'text-primary fill-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]'
                              : 'text-muted-foreground/40'
                          } transition-colors`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm font-bold text-primary tracking-wide">
                  {RATING_DESCRIPTIONS[hoverRating || rating]}
                </p>
              </div>

              {/* Vibe Tag Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                  Vibe Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TAGS.map((tag) => {
                    const selected = vibeTag === tag.label;
                    const Icon = tag.icon;
                    return (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => setVibeTag(tag.label)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                          selected
                            ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                            : 'bg-background/80 border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                        }`}
                      >
                        {Icon && <Icon size={12} className={selected ? 'text-primary-foreground' : tag.color} />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Attach Photo (Instagram Style)
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border h-48 group bg-muted">
                    <img src={imageUrl} alt="Review upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs transition-opacity"
                    >
                      <Camera size={18} /> Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-background/50 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-foreground">Click to upload photo</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* 1-Click Aesthetic Demo Presets */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono text-muted-foreground mb-1.5">Quick Demo Presets:</div>
                  <div className="flex gap-2">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          imageUrl === preset.url
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        📸 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Comment Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                  Your Review & Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Spill the tea... How's the coffee, crowd, music, Wi-Fi?"
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  required
                />
              </div>

              {/* Reward Notification Banner */}
              {!isEditing && (
                <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/40 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-2 bg-primary/20 text-primary rounded-xl shrink-0">
                    <Gift size={20} />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">Earn 20% OFF Monad NFT Coupon</span>
                    <span className="text-[10px] text-muted-foreground">
                      Awarded instantly to wallet <span className="font-mono text-foreground">{walletAddr.slice(0, 6)}...{walletAddr.slice(-4)}</span>
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isWithinRange}
                className={`w-full font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${
                  !isWithinRange
                    ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60'
                    : 'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_24px_rgba(204,255,0,0.3)]'
                }`}
              >
                {!isWithinRange ? (
                  <>
                    <Lock size={18} />
                    Locked (Must Be Within 250m of Venue)
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isEditing ? 'Updating Review...' : 'Minting Monad NFT & Posting...'}
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle2 size={18} />
                    Update My Review
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Post Review & Claim 20% NFT
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
