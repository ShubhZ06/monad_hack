'use client';

import React, { useState } from 'react';
import { X, Star, Flame, Sparkles, MapPin, Camera, Clock, MessageSquare, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  wallet_address: string;
  rating: number | null;
  vibe_tag: string | null;
  comment: string | null;
  image_url: string | null;
  created_at: string;
}

export interface VenueDetail {
  id: string;
  name: string;
  type: string;
  vibe_rating: string | null;
  image_url: string | null;
  reviews_count: number;
  address: string | null;
  reviews: Review[];
}

interface VenueReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueDetail | null;
  onOpenWriteReview: (venue: VenueDetail) => void;
  userWallet?: string;
}

// Generate a display name from a wallet address
function walletToName(addr: string): string {
  const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Chill', 'Hype', 'Alpha'];
  const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru', 'Builder'];
  const cleanAddr = addr.replace(/^0x/, '');
  const num1 = parseInt(cleanAddr.slice(0, 2) || '0', 16) % adjectives.length;
  const num2 = parseInt(cleanAddr.slice(2, 4) || '0', 16) % nouns.length;
  return `${adjectives[num1]}${nouns[num2]}`;
}

// Format relative time
function timeAgo(dateString: string): string {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Recent';
  }
}

export function VenueReviewsModal({
  isOpen,
  onClose,
  venue,
  onOpenWriteReview,
  userWallet,
}: VenueReviewsModalProps) {
  const [filter, setFilter] = useState<'ALL' | 'PHOTOS' | 'INSANE'>('ALL');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  if (!isOpen || !venue) return null;

  const reviews = venue.reviews || [];

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filter === 'PHOTOS') return Boolean(r.image_url);
    if (filter === 'INSANE') return r.vibe_tag?.toLowerCase() === 'insane';
    return true;
  });

  const hasUserReviewed = userWallet 
    ? reviews.some(r => r.wallet_address.toLowerCase() === userWallet.toLowerCase())
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border/80 shadow-[0_0_60px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Venue Cover */}
        <div className="relative h-44 sm:h-52 overflow-hidden bg-muted shrink-0">
          {venue.image_url ? (
            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
              <MapPin size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors border border-border z-10"
          >
            <X size={18} />
          </button>

          {/* Venue Info Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {venue.type}
                </span>
                {venue.vibe_rating && (
                  <span className="bg-background/80 backdrop-blur border border-border px-2.5 py-0.5 rounded-full text-[10px] font-bold text-foreground flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    {venue.vibe_rating}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight line-clamp-1">
                {venue.name}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {venue.address}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Stats Bar & Filter Tabs */}
        <div className="px-6 py-3.5 border-b border-border bg-background/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
              <Star size={16} className="text-primary fill-primary" />
              <span className="font-mono font-black text-sm text-primary">{avgRating}</span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {reviews.length} community {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filter === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('PHOTOS')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filter === 'PHOTOS'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera size={12} />
              Photos ({reviews.filter((r) => r.image_url).length})
            </button>
            <button
              onClick={() => setFilter('INSANE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filter === 'INSANE'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame size={12} className="text-orange-500" />
              Insane
            </button>
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <MessageSquare size={32} className="text-muted-foreground" />
              <p className="font-bold text-foreground text-sm">No reviews matching this filter</p>
              <p className="text-xs text-muted-foreground">Be the first to share a review with photo!</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewerName = walletToName(review.wallet_address);
              const isOwnReview = userWallet && review.wallet_address.toLowerCase() === userWallet.toLowerCase();

              return (
                <div
                  key={review.id}
                  className={`bg-background/90 border rounded-2xl p-4.5 transition-all flex flex-col gap-3 ${
                    isOwnReview
                      ? 'border-primary/50 shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                      : 'border-border/80'
                  }`}
                >
                  {/* Top: Avatar, Name, Rating & Time */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-primary/80 border border-primary/40 flex items-center justify-center font-bold text-xs text-background shrink-0">
                        {reviewerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">@{reviewerName}</span>
                          {isOwnReview && (
                            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.2 rounded-full font-bold">
                              You
                            </span>
                          )}
                          {review.vibe_tag && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              {review.vibe_tag}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(review.created_at)} • {review.wallet_address.slice(0, 6)}...{review.wallet_address.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={`${
                            (review.rating || 5) >= star
                              ? 'text-primary fill-primary'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-foreground/90 leading-relaxed pl-1">
                    {review.comment}
                  </p>

                  {/* Photo Attachment if present */}
                  {review.image_url && (
                    <div
                      onClick={() => setActivePhoto(review.image_url)}
                      className="rounded-xl overflow-hidden border border-border max-w-xs h-40 group cursor-pointer bg-muted relative"
                    >
                      <img
                        src={review.image_url}
                        alt="Review photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        🔍 Click to Enlarge
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-background/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            {reviews.length} verified check-in {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
          <button
            onClick={onClose}
            className="bg-secondary hover:bg-border text-secondary-foreground font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>

        {/* Photo Lightbox Preview */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-primary w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X size={24} />
            </button>
            <img
              src={activePhoto}
              alt="Enlarged review photo"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
