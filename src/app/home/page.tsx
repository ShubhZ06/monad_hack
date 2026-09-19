'use client';

import { WalletButton } from '@/components/WalletButton';
import { Flame, MapPin, Sparkles, Loader2, MapPinOff, Star, Navigation, Gift, MessageSquare } from 'lucide-react';
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
  { label: 'All', value: null, icon: Flame },
  { label: 'Cafes', value: 'Cafe', icon: null },
  { label: 'Restaurants', value: 'Restaurant', icon: null },
];

// Generate a display name from a wallet address
function walletToName(addr: string): string {
  const adjectives = ['Vibe', 'Neon', 'Based', 'Cyber', 'Chill', 'Hype'];
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

  // Active reviewing venue & pre-existing review (for anti-farming edit mode)
  const [reviewTargetReview, setReviewTargetReview] = useState<Review | null>(null);
  const [hasClaimedForTarget, setHasClaimedForTarget] = useState(false);

  // Simulated presence toggle for demo testing
  const [isSimulatedAtVenue, setIsSimulatedAtVenue] = useState(true);

  // Default simulated check-in venue (requested: "for temporary make my location a cafe")
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

  // Fetch venues once geolocation resolves (or fails)
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

  // When user's GPS coordinates are detected, automatically anchor Monad Cafe to their current location
  useEffect(() => {
    if (latitude && longitude) {
      setCheckedInVenue((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [latitude, longitude]);

  // Format distance for display
  const formatDistance = (km?: number) => {
    if (km == null) return null;
    if (km <= 0.05) return 'In Venue (Verified)';
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)} km away`;
  };

  // Get the most recent review for a venue
  const getLatestReview = (reviews: Review[]): Review | null => {
    if (!reviews || reviews.length === 0) return null;
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  // Open review composer for a venue with anti-farming detection
  const openReviewComposer = (targetVenue: { id: string; name: string; type: string; address?: string | null; image_url?: string | null }) => {
    const venueObj = venues.find(v => v.id === targetVenue.id || v.name.toLowerCase() === targetVenue.name.toLowerCase());
    
    // Check if user already reviewed this venue
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

  // Callback when a review is submitted
  const handleReviewSubmitted = (newReview: any, newCoupon?: any) => {
    fetchVenues(activeFilter);
    if (newCoupon) {
      setCoupons((prev) => [newCoupon, ...prev.filter((c) => c.id !== newCoupon.id)]);
    }
    // Update selected venue modal if open
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
    <div className="min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-tighter">
            MONAD<span className="text-primary">.PWA</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Coupons Button with Unread Badge */}
            <button
              onClick={() => setIsCouponsDrawerOpen(true)}
              className="bg-card border border-primary/40 hover:border-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 text-foreground transition-all shadow-[0_0_12px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)] group"
            >
              <Gift size={15} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">My Coupons</span>
              {coupons.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {coupons.length}
                </span>
              )}
            </button>

            <WalletButton className="!px-4 !py-2 !text-sm !rounded-lg !shadow-none" showIcon={false} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Discover the <span className="text-primary">Vibe</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Real ratings from real check-ins. Browse trusted venues, view all community reviews, and earn 20% Monad NFT discount coupons!
          </p>
        </header>

        {/* Location Status Banner */}
        <div className="mb-6">
          {geoLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-primary" />
              Detecting your location...
            </div>
          ) : latitude && longitude ? (
            <div className="flex items-center gap-2 text-sm text-foreground bg-card border border-primary/40 rounded-xl px-4 py-3 shadow-[0_0_15px_rgba(204,255,0,0.08)]">
              <Navigation size={16} className="text-primary animate-pulse" />
              <span>Monad Cafe & Roastery automatically detected at your location</span>
              <span className="text-primary font-bold ml-auto flex items-center gap-1.5 text-xs bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block" />
                Live In-Venue
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-3">
              <MapPinOff size={16} />
              <span>Location unavailable — showing all venues by popularity</span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_TYPES.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.label}
                onClick={() => handleFilterClick(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-border'
                }`}
              >
                {filter.icon && <filter.icon size={16} />}
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-10 bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MapPinOff size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No venues found nearby</h3>
            <p className="text-muted-foreground max-w-md">
              {activeFilter
                ? `No ${activeFilter} venues found. Try clearing your filter.`
                : 'There are no venues in your area yet. Be the first to add one!'}
            </p>
          </div>
        ) : (
          /* Venue Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {venues.map((venue) => {
              const latestReview = getLatestReview(venue.reviews);
              const distance = formatDistance(venue.distance_km);
              const userReview = address 
                ? venue.reviews?.find(r => r.wallet_address.toLowerCase() === address.toLowerCase())
                : null;
              const reviewsCount = venue.reviews_count || venue.reviews?.length || 0;

              return (
                <div
                  key={venue.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {venue.image_url ? (
                      <img
                        src={venue.image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <MapPin size={32} />
                      </div>
                    )}
                    {/* Vibe Badge */}
                    {venue.vibe_rating && (
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-border flex items-center gap-1">
                        {venue.vibe_rating === 'Insane' && <Flame size={14} className="text-orange-500" />}
                        {venue.vibe_rating === 'Worth it' && <Sparkles size={14} className="text-primary" />}
                        Vibe: <span className={venue.vibe_rating === 'Insane' ? 'text-primary' : ''}>{venue.vibe_rating}</span>
                      </div>
                    )}
                    {/* Distance Badge */}
                    {distance && (
                      <div className={`absolute top-3 right-3 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                        venue.distance_km != null && venue.distance_km <= 0.05
                          ? 'bg-primary/20 border-primary/60 text-primary shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                          : 'bg-background/90 border-border text-foreground'
                      }`}>
                        <Navigation size={12} className={venue.distance_km != null && venue.distance_km <= 0.05 ? 'text-primary' : 'text-muted-foreground'} />
                        {distance}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold line-clamp-1">{venue.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin size={14} />
                      <span>{venue.type}</span>
                      {venue.address && <span> • {venue.address}</span>}
                    </div>

                    {/* Review Count CTA -> Click to open All Reviews Modal */}
                    <button
                      onClick={() => setSelectedVenueForReviews(venue)}
                      className="flex items-center gap-1.5 text-sm text-primary font-bold hover:underline mb-3 self-start group/rev"
                      title="View all community reviews"
                    >
                      <Star size={14} className="text-primary fill-primary" />
                      <span>{reviewsCount} reviews</span>
                      <span className="text-xs text-muted-foreground group-hover/rev:text-primary font-normal">• View all ▾</span>
                    </button>

                    {/* Latest Review Snippet + CTA to view all reviews */}
                    {latestReview && latestReview.comment && (
                      <div className="bg-background border border-border rounded-xl p-3 mb-4 text-sm flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-primary">
                            @{walletToName(latestReview.wallet_address)}
                          </span>
                          {latestReview.vibe_tag && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-accent-foreground bg-accent px-2 py-0.5 rounded-md border border-border">
                              {latestReview.vibe_tag}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-xs">{latestReview.comment}</p>
                        
                        {/* Interactive CTA to open all real-time reviews */}
                        <button
                          onClick={() => setSelectedVenueForReviews(venue)}
                          className="text-[11px] text-primary hover:underline font-bold self-start flex items-center gap-1 pt-1"
                        >
                          <MessageSquare size={11} />
                          <span>View all {reviewsCount} community reviews →</span>
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-border flex gap-2">
                      <button
                        onClick={() => setSelectedVenueForReviews(venue)}
                        className="flex-1 bg-card hover:bg-border border border-border hover:border-primary/50 px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-foreground group/revbtn"
                        title="See all community reviews for this venue"
                      >
                        <MessageSquare size={14} className="text-primary group-hover/revbtn:scale-110 transition-transform" />
                        <span>All Reviews ({reviewsCount})</span>
                      </button>

                      <Link href="/events" className="flex-1 block">
                        <button className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-xl transition-colors text-xs">
                          Propose Trip
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Instagram-Style Check-In Peeking Widget on the Right */}
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
