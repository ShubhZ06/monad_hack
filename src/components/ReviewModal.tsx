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
  1: 'Mid',
  2: 'Decent',
  3: 'Worth it',
  4: 'Exceptional',
  5: 'Outstanding',
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-neutral-200 shadow-2xl rounded-t-[32px] sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* iOS Grab Handle for Mobile */}
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-neutral-150 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">Verified Location</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 truncate">{venue.name}</h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar flex-1">
          {successData ? (
            /* SUCCESS REWARD SCREEN */
            <div className="py-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
                  {successData.coupon ? 'Review Posted & NFT Claimed!' : 'Review Updated!'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                  {successData.coupon
                    ? 'Your review is live on the discovery feed and your Monad NFT coupon is ready.'
                    : 'Your review has been updated. (Limit: 1 discount coupon per venue to prevent farming).'}
                </p>
              </div>

              {/* Claimed Monad NFT Coupon Card */}
              {successData.coupon ? (
                <div className="w-full bg-gradient-to-b from-orange-50 via-white to-white border-2 border-primary/40 rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                      Monad Testnet NFT #{successData.coupon.token_id}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <Gift size={12} className="text-primary" /> Verified Reward
                    </span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-extrabold text-neutral-900 mb-1">
                    {successData.coupon.discount_title}
                  </h4>
                  <p className="text-xs text-neutral-500 mb-4">
                    Valid for all food & beverages at <span className="text-neutral-800 font-semibold">{venue.name}</span>
                  </p>

                  {/* Coupon Voucher Code Box */}
                  <div className="bg-white border border-dashed border-primary/60 rounded-xl p-3 flex items-center justify-between mb-3 shadow-inner">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block">Voucher Code</span>
                      <span className="font-mono font-bold text-base text-primary tracking-widest">
                        {successData.coupon.discount_code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(successData.coupon.discount_code)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
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
                      className="text-[11px] text-neutral-400 hover:text-primary flex items-center gap-1 font-mono transition-colors"
                    >
                      <span>Tx: {successData.coupon.monad_tx_hash.slice(0, 10)}...{successData.coupon.monad_tx_hash.slice(-8)}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <CheckCircle2 size={15} /> 1 NFT Coupon Per Venue Rule
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    You already have a valid Monad 20% discount coupon in your wallet for <span className="text-neutral-800 font-semibold">{venue.name}</span>. Duplicate coupon minting is prevented to protect venue partners.
                  </p>
                </div>
              )}

              {/* Post Success Actions */}
              <div className="flex gap-2.5 w-full pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3 rounded-full text-xs transition-colors cursor-pointer"
                >
                  Back to Feed
                </button>
                <button
                  onClick={() => {
                    handleResetAndClose();
                    onOpenCoupons();
                  }}
                  className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 font-semibold py-3 rounded-full text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Gift size={14} />
                  <span>View My Coupons</span>
                </button>
              </div>
            </div>
          ) : (
            /* REVIEW COMPOSER FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anti-Farming Rule Callout if editing */}
              {isEditing && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800">
                  <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                  <span>
                    You already reviewed this venue. Submitting will update your review. (Limit: 1 coupon per venue).
                  </span>
                </div>
              )}

              {/* Proof of Location Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isWithinRange
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {isWithinRange ? (
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {isWithinRange ? 'Proof of Location: Verified Inside' : 'Location Gate: Outside Venue'}
                    </span>
                    <span className="text-[10px] opacity-85">
                      {isWithinRange
                        ? `Within ${venue.name} check-in boundary (${distanceMeters ?? 24}m, max 250m)`
                        : `You are ${distanceMeters ? distanceMeters + 'm' : 'too far'} away. Must be within 250m.`}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  isWithinRange ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isWithinRange ? 'Eligible' : 'Blocked'}
                </span>
              </div>

              {/* Star Rating Section */}
              <div className="text-center space-y-1.5 bg-neutral-50 py-3 rounded-2xl border border-neutral-150">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Tap to Rate
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
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={`${
                            active
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-300'
                          } transition-colors`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-bold text-neutral-800">
                  {RATING_DESCRIPTIONS[hoverRating || rating]}
                </p>
              </div>

              {/* Vibe Tag Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Vibe Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {VIBE_TAGS.map((tag) => {
                    const selected = vibeTag === tag.label;
                    const Icon = tag.icon;
                    return (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => setVibeTag(tag.label)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          selected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {Icon && <Icon size={12} className={selected ? 'text-white' : tag.color} />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                    Attach Photo (Instagram Style)
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 h-44 group bg-neutral-100">
                    <img src={imageUrl} alt="Review upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-semibold text-xs transition-opacity cursor-pointer"
                    >
                      <Camera size={16} /> Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-50 flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-600 flex items-center justify-center shadow-sm">
                      <Upload size={16} />
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">Click to upload photo</p>
                    <p className="text-[10px] text-neutral-400">PNG, JPG up to 5MB</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Quick Aesthetic Presets */}
                <div className="pt-0.5">
                  <div className="text-[10px] font-medium text-neutral-400 mb-1">Quick Presets:</div>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                          imageUrl === preset.url
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Camera size={11} className="inline mr-1" />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Comment Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How's the coffee, music, vibe, crowd?"
                  rows={3}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                  required
                />
              </div>

              {/* Reward Notification Banner */}
              {!isEditing && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/15 text-primary rounded-lg shrink-0">
                    <Gift size={18} />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 block">Earn 20% OFF Monad NFT Coupon</span>
                    <span className="text-[10px] text-neutral-500">
                      Awarded instantly to wallet <span className="font-mono text-neutral-700">{walletAddr.slice(0, 6)}...{walletAddr.slice(-4)}</span>
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isWithinRange}
                className={`w-full font-bold py-3 rounded-full flex items-center justify-center gap-2 text-xs transition-all cursor-pointer ${
                  !isWithinRange
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm active:scale-98'
                }`}
              >
                {!isWithinRange ? (
                  <>
                    <Lock size={15} />
                    <span>Locked (Must Be Within 250m)</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>{isEditing ? 'Updating Review...' : 'Minting Monad NFT & Posting...'}</span>
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Update My Review</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-primary" />
                    <span>Post Review & Claim 20% NFT</span>
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

