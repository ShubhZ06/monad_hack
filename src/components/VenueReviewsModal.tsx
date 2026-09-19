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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#eee7dc] shadow-2xl rounded-t-[32px] sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* iOS Grab Bar for mobile */}
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header with Venue Cover */}
        <div className="relative h-40 sm:h-48 overflow-hidden bg-neutral-100 shrink-0">
          {venue.image_url ? (
            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <MapPin size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-neutral-700 hover:text-neutral-900 flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10"
          >
            <X size={16} />
          </button>

          {/* Venue Info Overlay */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {venue.type}
                </span>
                {venue.vibe_rating && (
                  <span className="bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-neutral-900 flex items-center gap-1 shadow-sm">
                    <Flame size={12} className="text-primary fill-primary" />
                    {venue.vibe_rating}
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight line-clamp-1">
                {venue.name}
              </h2>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {venue.address}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Stats Bar & Filter Tabs */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#eee7dc] bg-[#faf8f5] flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-[#eee7dc] px-2.5 py-1 rounded-full shadow-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-mono font-bold text-xs text-neutral-900">{avgRating}</span>
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              {reviews.length} community {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-[#eee7dc] text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('PHOTOS')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filter === 'PHOTOS'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-[#eee7dc] text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Camera size={12} />
              Photos ({reviews.filter((r) => r.image_url).length})
            </button>
            <button
              onClick={() => setFilter('INSANE')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filter === 'INSANE'
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-[#eee7dc] text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Flame size={12} className="text-primary fill-primary" />
              Insane
            </button>
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1 no-scrollbar">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <MessageSquare size={32} className="text-neutral-300" />
              <p className="font-bold text-neutral-800 text-sm">No reviews matching this filter</p>
              <p className="text-xs text-neutral-500">Be the first to share a review with photo!</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewerName = walletToName(review.wallet_address);
              const isOwnReview = userWallet && review.wallet_address.toLowerCase() === userWallet.toLowerCase();

              return (
                <div
                  key={review.id}
                  className={`bg-[#fbf9f5] border rounded-2xl p-4 transition-all flex flex-col gap-2.5 ${
                    isOwnReview
                      ? 'border-primary/40 bg-orange-50/20'
                      : 'border-[#eee7dc]'
                  }`}
                >
                  {/* Top: Avatar, Name, Rating & Time */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full season-story-ring p-[1.5px] shrink-0">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-[10px] text-neutral-800">
                          {reviewerName.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-neutral-900">@{reviewerName}</span>
                          {isOwnReview && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
                              You
                            </span>
                          )}
                          {review.vibe_tag && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                              {review.vibe_tag}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {timeAgo(review.created_at)} • {review.wallet_address.slice(0, 6)}...{review.wallet_address.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={`${
                            (review.rating || 5) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-neutral-700 leading-relaxed pl-0.5">
                    "{review.comment}"
                  </p>

                  {/* Review Photo Attachment */}
                  {review.image_url && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-[#eee7dc] max-h-56 bg-neutral-100">
                      <img
                        src={review.image_url}
                        alt="User review attachment"
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-300 cursor-pointer"
                        onClick={() => setActivePhoto(review.image_url)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Write Review Action */}
        <div className="p-4 border-t border-[#eee7dc] bg-[#faf8f5] flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-neutral-900">
              {hasUserReviewed ? 'You reviewed this venue' : 'Visited this venue?'}
            </p>
            <p className="text-[11px] text-neutral-500">
              {hasUserReviewed
                ? 'Update your feedback anytime'
                : 'Share your vibe & earn a 20% Monad NFT coupon'}
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenWriteReview(venue);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 py-2.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Sparkles size={13} className="text-primary" />
            <span>{hasUserReviewed ? 'Edit My Review' : 'Write Review'}</span>
          </button>
        </div>
      </div>

      {/* Lightbox for Enlarged Photo */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActivePhoto(null)}
        >
          <img
            src={activePhoto}
            alt="Enlarged review photo"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}

