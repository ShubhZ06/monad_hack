'use client';

import { WalletButton } from '@/components/WalletButton';
import { Flame, MapPin, Sparkles, Loader2, MapPinOff, Star, Navigation, Gift, MessageSquare, Heart, Bookmark, Share2, MoreHorizontal, CheckCircle2, Coffee, Utensils, Award } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAccount } from 'wagmi';
import { CheckInPeekingWidget, VenueSimple } from '@/components/CheckInPeekingWidget';
import { ReviewModal } from '@/components/ReviewModal';
import { CouponsDrawer, CouponItem } from '@/components/CouponsDrawer';
import { VenueReviewsModal } from '@/components/VenueReviewsModal';

// Types
interface Review {
  id: string;
  wallet_address: string;
  rating: number | null;
  vibe_tag: string | null;
  comment: string | null;
  image_url: string | null;
  created_at: string;
}

interface Venue {
  id: string;
  name: string;
  type: string;
  vibe_rating: string | null;
  image_url: string | null;
  reviews_count: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number;
  reviews: Review[];
}

const FILTER_TYPES = [
  { label: 'All Vibes', value: null, icon: Flame },
  { label: 'Cafes', value: 'Cafe', icon: Coffee },
  { label: 'Restaurants', value: 'Restaurant', icon: Utensils },
];

// Generate a display name from a wallet address
function walletToName(addr: string): string {
  const adjectives = ['Vibe', 'Based', 'Cyber', 'Chill', 'Hype', 'Aura'];
  const nouns = ['Rider', 'Whale', 'Degen', 'Punk', 'Chad', 'Guru'];
  const clean = addr.replace(/^0x/, '');
  const num1 = parseInt(clean.slice(0, 2) || '0', 16) % adjectives.length;
  const num2 = parseInt(clean.slice(2, 4) || '0', 16) % nouns.length;
  return `${adjectives[num1]}${nouns[num2]}`;
}

export default function DiscoveryFeed() {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { address } = useAccount();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Review & Coupon States
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCouponsDrawerOpen, setIsCouponsDrawerOpen] = useState(false);
  const [selectedVenueForReviews, setSelectedVenueForReviews] = useState<Venue | null>(null);

  // Interactive like states per venue
  const [likedVenues, setLikedVenues] = useState<Record<string, boolean>>({});
  const [savedVenues, setSavedVenues] = useState<Record<string, boolean>>({});
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Active reviewing venue & pre-existing review (for anti-farming edit mode)
  const [reviewTargetReview, setReviewTargetReview] = useState<Review | null>(null);
  const [hasClaimedForTarget, setHasClaimedForTarget] = useState(false);

  // Simulated presence toggle for demo testing
  const [isSimulatedAtVenue, setIsSimulatedAtVenue] = useState(true);

  // Default simulated check-in venue
  const [checkedInVenue, setCheckedInVenue] = useState<VenueSimple>({
    id: 'venue-monad-cafe',
    name: 'Monad Cafe & Roastery',
    type: 'Cafe',
    address: 'Juhu, Mumbai',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    latitude: 19.1070,
    longitude: 72.8370,
  });

  const fetchVenues = useCallback(async (type: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (latitude && longitude) {
        params.set('lat', latitude.toString());
        params.set('lng', longitude.toString());
        params.set('radius', '10'); // 10km radius
      }
      if (type) {
        params.set('type', type);
      }

      const res = await fetch(`/api/venues?${params.toString()}`);
      const data = await res.json();
      setVenues(data.venues || []);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  // Fetch Coupons for user's wallet
  const fetchCoupons = useCallback(async () => {
    try {
      const walletParam = address ? `?wallet=${address}` : '';
      const res = await fetch(`/api/coupons${walletParam}`);
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  }, [address]);

  useEffect(() => {
    if (!geoLoading) {
      fetchVenues(activeFilter);
    }
  }, [geoLoading, activeFilter, fetchVenues]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleFilterClick = (type: string | null) => {
    setActiveFilter(type);
  };

  useEffect(() => {
    if (latitude && longitude) {
      setCheckedInVenue((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [latitude, longitude]);

  const formatDistance = (km?: number) => {
    if (km == null) return null;
    if (km <= 0.05) return 'In Venue';
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)} km away`;
  };

  const getLatestReview = (reviews: Review[]): Review | null => {
    if (!reviews || reviews.length === 0) return null;
    return [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const toggleLike = (venueId: string) => {
    setLikedVenues(prev => ({ ...prev, [venueId]: !prev[venueId] }));
  };

  const toggleSave = (venueId: string) => {
    setSavedVenues(prev => ({ ...prev, [venueId]: !prev[venueId] }));
  };

  const handleShare = (venueName: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/home?venue=${encodeURIComponent(venueName)}`);
      setShareToast(`Copied ${venueName} invite link!`);
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  // Open review composer for a venue with anti-farming detection
  const openReviewComposer = (targetVenue: { id: string; name: string; type: string; address?: string | null; image_url?: string | null }) => {
    const venueObj = venues.find(v => v.id === targetVenue.id || v.name.toLowerCase() === targetVenue.name.toLowerCase());
    
    let existing: Review | null = null;
    let claimed = false;

    if (address && venueObj) {
      existing = venueObj.reviews?.find(r => r.wallet_address.toLowerCase() === address.toLowerCase()) || null;
      claimed = coupons.some(c => c.venue_id === venueObj.id || c.venue_name.toLowerCase() === venueObj.name.toLowerCase());
    }

    setCheckedInVenue({
      id: targetVenue.id,
      name: targetVenue.name,
      type: targetVenue.type,
      address: targetVenue.address || '',
      image_url: targetVenue.image_url || '',
      latitude: venueObj?.latitude ?? undefined,
      longitude: venueObj?.longitude ?? undefined,
    });

    setReviewTargetReview(existing);
    setHasClaimedForTarget(claimed || Boolean(existing));
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = (newReview: any, newCoupon?: any) => {
    fetchVenues(activeFilter);
    if (newCoupon) {
      setCoupons((prev) => [newCoupon, ...prev.filter((c) => c.id !== newCoupon.id)]);
    }
    if (selectedVenueForReviews) {
      setSelectedVenueForReviews((prev) => {
        if (!prev) return null;
        const updatedReviews = [newReview, ...(prev.reviews || []).filter(r => r.id !== newReview.id && r.wallet_address.toLowerCase() !== newReview.wallet_address.toLowerCase())];
        return {
          ...prev,
          reviews: updatedReviews,
          reviews_count: updatedReviews.length,
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-28">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
          {shareToast}
        </div>
      )}

      {/* Main Feed Container */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4">
        
        {/* Instagram Stories Carousel */}
        <div className="bg-white border border-[#eee7dc] rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-primary" /> Live Spots & Stories
            </span>
            <button 
              onClick={() => setIsCouponsDrawerOpen(true)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Gift size={12} />
              <span>{coupons.length} NFT Rewards</span>
            </button>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1 pt-0.5">
            {/* Story 1: User's Verified Check-in */}
            <button
              onClick={() => openReviewComposer(checkedInVenue)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-full season-story-ring p-[2.5px] transition-transform group-hover:scale-105">
                  <img
                    src={checkedInVenue.image_url}
                    alt={checkedInVenue.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white flex items-center gap-0.5">
                  LIVE
                </span>
              </div>
              <span className="text-[11px] font-medium text-neutral-800 max-w-[68px] truncate">
                Check-in
              </span>
            </button>

            {/* Stories from Venue list */}
            {venues.slice(0, 8).map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVenueForReviews(v)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-full season-story-ring p-[2px] transition-transform group-hover:scale-105">
                  <img
                    src={v.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop'}
                    alt={v.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-600 max-w-[68px] truncate">
                  {v.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>


        {/* Location Status Bar */}
        <div className="mb-4">
          {geoLoading ? (
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white border border-neutral-200/80 rounded-xl px-3.5 py-2.5 shadow-sm">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>Checking GPS location...</span>
            </div>
          ) : latitude && longitude ? (
            <div className="flex items-center justify-between bg-white border border-neutral-200/80 rounded-xl px-3.5 py-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-neutral-800 truncate pr-2">
                <Navigation size={13} className="text-primary shrink-0" />
                <span className="truncate font-medium">GPS Active • Monad Cafe & Roastery nearby</span>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In-Venue Proof
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white border border-neutral-200/80 rounded-xl px-3.5 py-2.5 shadow-sm">
              <MapPinOff size={14} />
              <span>Location off • Showing verified trending spots</span>
            </div>
          )}
        </div>

        {/* Filter Chips (Instagram Horizontal Scroll) */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {FILTER_TYPES.map((filter) => {
            const isActive = activeFilter === filter.value;
            const Icon = filter.icon;
            return (
              <button
                key={filter.label}
                onClick={() => handleFilterClick(filter.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {Icon && <Icon size={13} className={isActive ? 'text-primary' : 'text-neutral-500'} />}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-neutral-200/70 rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 bg-neutral-100 rounded w-1/3" />
                    <div className="h-3 bg-neutral-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-64 bg-neutral-100 rounded-xl" />
                <div className="h-4 bg-neutral-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center my-6">
            <MapPinOff size={40} className="text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800 mb-1">No venues found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {activeFilter ? `No ${activeFilter} matches nearby. Try switching back to All Vibes.` : 'No venues listed yet.'}
            </p>
          </div>
        ) : (
          /* Instagram Feed Posts Column */
          <div className="space-y-5 sm:space-y-6">
            {venues.map((venue) => {
              const latestReview = getLatestReview(venue.reviews);
              const distance = formatDistance(venue.distance_km);
              const isLiked = likedVenues[venue.id] || false;
              const isSaved = savedVenues[venue.id] || false;
              const reviewsCount = venue.reviews_count || venue.reviews?.length || 0;
              const displayLikes = (reviewsCount * 7) + (isLiked ? 1 : 0);

              return (
                <article
                  key={venue.id}
                  className="bg-white border border-[#eee7dc] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                >
                  {/* Post Header */}
                  <div className="px-3.5 sm:px-4 py-3 flex items-center justify-between border-b border-[#f4f0e8]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full season-story-ring p-[2px]">
                        <img
                          src={venue.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop'}
                          alt={venue.name}
                          className="w-full h-full rounded-full object-cover border border-white"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-display font-bold text-base text-neutral-900 leading-tight tracking-tight">
                            {venue.name}
                          </h3>
                          <CheckCircle2 size={13} className="text-primary fill-primary text-white shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 leading-none mt-0.5">
                          <span>{venue.type}</span>
                          {venue.address && <span>• {venue.address.split(',')[0]}</span>}
                          {distance && (
                            <span className="text-emerald-600 font-semibold">• {distance}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleShare(venue.name)}
                      className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                      title="Share spot"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Post Photo (4:3 or 16:9 rich edge-to-edge media) */}
                  <div 
                    className="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer group"
                    onDoubleClick={() => toggleLike(venue.id)}
                  >
                    <img
                      src={venue.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />

                    {/* Vibe Badge */}
                    {venue.vibe_rating && (
                      <div className="absolute top-3 left-3 bg-white/90 frosted-pill px-2.5 py-1 rounded-full text-xs font-bold text-neutral-900 border border-white/40 shadow-sm flex items-center gap-1">
                        {venue.vibe_rating === 'Insane' && <Flame size={13} className="text-primary fill-primary" />}
                        {venue.vibe_rating === 'Worth it' && <Sparkles size={13} className="text-amber-500" />}
                        <span>{venue.vibe_rating}</span>
                      </div>
                    )}

                    {/* NFT Coupon Reward Badge */}
                    <div className="absolute top-3 right-3 bg-neutral-900/85 frosted-pill text-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/20 shadow-sm flex items-center gap-1">
                      <Gift size={11} className="text-primary" />
                      <span>20% NFT Reward</span>
                    </div>
                  </div>

                  {/* Post Action Buttons Bar */}
                  <div className="px-3.5 sm:px-4 pt-3 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Heart / Like Button */}
                      <button
                        onClick={() => toggleLike(venue.id)}
                        className="transition-transform active:scale-125 focus:outline-none cursor-pointer"
                        title="Like this vibe"
                      >
                        <Heart
                          size={24}
                          className={`transition-colors ${
                            isLiked
                              ? 'fill-primary text-primary'
                              : 'text-neutral-800 hover:text-neutral-600'
                          }`}
                        />
                      </button>

                      {/* Comment / Reviews Sheet Trigger */}
                      <button
                        onClick={() => setSelectedVenueForReviews(venue)}
                        className="text-neutral-800 hover:text-neutral-600 transition-transform active:scale-110 cursor-pointer"
                        title="View reviews & vibe check"
                      >
                        <MessageSquare size={22} />
                      </button>

                      {/* Share / Invite */}
                      <button
                        onClick={() => handleShare(venue.name)}
                        className="text-neutral-800 hover:text-neutral-600 transition-transform active:scale-110 cursor-pointer"
                        title="Share with group"
                      >
                        <Share2 size={21} />
                      </button>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleSave(venue.id)}
                      className="text-neutral-800 hover:text-neutral-600 transition-transform active:scale-110 cursor-pointer"
                      title="Save to bucket list"
                    >
                      <Bookmark
                        size={22}
                        className={isSaved ? 'fill-neutral-900 text-neutral-900' : ''}
                      />
                    </button>
                  </div>

                  {/* Likes & Vibe Stats */}
                  <div className="px-3.5 sm:px-4 pb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                      <span>Liked by</span>
                      <span className="text-primary hover:underline cursor-pointer">@BasedRider</span>
                      <span>and</span>
                      <span>{displayLikes} others</span>
                    </div>
                  </div>

                  {/* Caption & Recent Review Snippet */}
                  <div className="px-3.5 sm:px-4 pb-3 space-y-1.5">
                    {/* Venue Headline */}
                    <p className="text-xs text-neutral-800 leading-relaxed">
                      <span className="font-display font-bold text-sm mr-1.5 text-neutral-900">{venue.name}</span>
                      <span className="text-neutral-600">
                        {venue.type === 'Cafe' ? 'Artisan coffee, specialty roasts & curated community vibes.' : 'Curated dining experience with verified on-chain check-ins.'}
                      </span>
                    </p>

                    {/* Latest Community Review Comment */}
                    {latestReview && latestReview.comment && (
                      <div className="text-xs bg-[#fbf9f5] rounded-xl p-2.5 border border-[#eee7dc]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-neutral-900 text-[11px]">
                            @{walletToName(latestReview.wallet_address)}
                          </span>
                          {latestReview.vibe_tag && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                              {latestReview.vibe_tag}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 ml-auto flex items-center gap-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {latestReview.rating || 5}.0
                          </span>
                        </div>
                        <p className="text-neutral-600 line-clamp-2 leading-relaxed">
                          "{latestReview.comment}"
                        </p>
                      </div>
                    )}

                    {/* View All Reviews Sheet CTA */}
                    <button
                      onClick={() => setSelectedVenueForReviews(venue)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 font-medium pt-1 block cursor-pointer transition-colors"
                    >
                      View all {reviewsCount} reviews & mint discount coupon...
                    </button>
                  </div>

                  {/* Instagram-style Action Button Strip */}
                  <div className="px-3.5 sm:px-4 py-2.5 bg-[#fbf9f5] border-t border-[#eee7dc] flex items-center gap-2">
                    <button
                      onClick={() => openReviewComposer(venue)}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-semibold text-xs py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Sparkles size={12} className="text-primary" />
                      <span>Review & Earn NFT</span>
                    </button>

                    <Link href="/events" className="flex-1 block">
                      <button className="w-full bg-[#f4f0e8] hover:bg-[#eee7dc] active:scale-98 text-neutral-800 border border-[#eee7dc] font-semibold text-xs py-2.5 px-3 rounded-full transition-all text-center cursor-pointer">
                        Propose Trip
                      </button>
                    </Link>
                  </div>
                </article>
              );

            })}
          </div>
        )}
      </main>

      {/* Check-In Peeking Widget */}
      <CheckInPeekingWidget
        currentVenue={checkedInVenue}
        availableVenues={venues.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          address: v.address || '',
          image_url: v.image_url || '',
          latitude: v.latitude ?? undefined,
          longitude: v.longitude ?? undefined,
        }))}
        onSelectVenue={(v) => setCheckedInVenue(v)}
        onOpenReview={() => openReviewComposer(checkedInVenue)}
        onOpenCoupons={() => setIsCouponsDrawerOpen(true)}
        couponsCount={coupons.length}
        userLat={latitude}
        userLng={longitude}
        isSimulatedAtVenue={isSimulatedAtVenue}
        onToggleSimulate={() => setIsSimulatedAtVenue((prev) => !prev)}
      />

      {/* Review Modal with Anti-Farming & Location Proof Mode */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewTargetReview(null);
          setHasClaimedForTarget(false);
        }}
        venue={checkedInVenue}
        onReviewSubmitted={handleReviewSubmitted}
        onOpenCoupons={() => setIsCouponsDrawerOpen(true)}
        existingReview={reviewTargetReview}
        alreadyClaimedCoupon={hasClaimedForTarget}
        userLat={latitude}
        userLng={longitude}
        isSimulatedAtVenue={isSimulatedAtVenue}
      />

      {/* All Reviews Modal for a Selected Venue */}
      <VenueReviewsModal
        isOpen={Boolean(selectedVenueForReviews)}
        onClose={() => setSelectedVenueForReviews(null)}
        venue={selectedVenueForReviews}
        onOpenWriteReview={(venue) => openReviewComposer(venue)}
        userWallet={address}
      />

      {/* Coupons Drawer */}
      <CouponsDrawer
        isOpen={isCouponsDrawerOpen}
        onClose={() => setIsCouponsDrawerOpen(false)}
        coupons={coupons}
      />
    </div>
  );
}
