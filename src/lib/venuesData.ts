// Fallback venue data and in-memory review manager
export interface ReviewItem {
  id: string;
  venue_id: string;
  wallet_address: string;
  rating: number;
  vibe_tag: string;
  comment: string;
  image_url?: string;
  created_at: string;
}

export interface VenueItem {
  id: string;
  name: string;
  type: string;
  vibe_rating: string;
  image_url: string;
  reviews_count: number;
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
  reviews: ReviewItem[];
}

export const SEED_VENUES: VenueItem[] = [
  {
    id: 'venue-monad-cafe',
    name: 'Monad Cafe & Roastery',
    type: 'Cafe',
    vibe_rating: 'Insane',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    reviews_count: 7,
    latitude: 19.1070,
    longitude: 72.8370,
    address: 'Juhu, Mumbai',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviews: [
      {
        id: 'rev-monad-1',
        venue_id: 'venue-monad-cafe',
        wallet_address: '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
        rating: 5,
        vibe_tag: 'Insane',
        comment: 'Perfect for working and the cold brew is elite. Fast wifi and great playlist.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'rev-monad-2',
        venue_id: 'venue-monad-cafe',
        wallet_address: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C',
        rating: 5,
        vibe_tag: 'Insane',
        comment: 'The avocado toast and matcha latte combo is unreal. Aesthetic interior too.',
        image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'rev-monad-3',
        venue_id: 'venue-monad-cafe',
        wallet_address: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
        rating: 4,
        vibe_tag: 'Worth it',
        comment: 'Good coffee, good wifi, good people. Can get noisy after 4pm though.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'venue-neon-bistro',
    name: 'Neon Roast & Bistro',
    type: 'Restaurant',
    vibe_rating: 'Worth it',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    reviews_count: 4,
    latitude: 19.1245,
    longitude: 72.8520,
    address: 'Bandra West, Mumbai',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviews: [
      {
        id: 'rev-bistro-1',
        venue_id: 'venue-neon-bistro',
        wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B',
        rating: 4,
        vibe_tag: 'Worth it',
        comment: 'Great sourdough pizzas and espresso bar. Aesthetic ambient lighting in the evening.',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'rev-bistro-2',
        venue_id: 'venue-neon-bistro',
        wallet_address: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C',
        rating: 5,
        vibe_tag: 'Insane',
        comment: 'Truffle fries and craft cold brews were incredible. A bit far to walk from Juhu but worth visiting.',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
  },
];

// Global in-memory list so user additions persist during dev session
export let liveVenues: VenueItem[] = JSON.parse(JSON.stringify(SEED_VENUES));

export function hasUserReviewedVenue(walletAddress: string, venueIdOrName: string): boolean {
  const cleanWallet = walletAddress.toLowerCase();
  const targetVenue = liveVenues.find(
    v => v.id === venueIdOrName || v.name.toLowerCase() === venueIdOrName.toLowerCase()
  );
  if (!targetVenue) return false;
  return targetVenue.reviews.some(r => r.wallet_address.toLowerCase() === cleanWallet);
}

export function addReviewToMemory(newReview: ReviewItem, venueName?: string): { venue: VenueItem; review: ReviewItem; isNewReview: boolean } {
  let targetVenue = liveVenues.find(
    v => v.id === newReview.venue_id || (venueName && v.name.toLowerCase() === venueName.toLowerCase())
  );

  if (!targetVenue) {
    targetVenue = liveVenues[0]; // fallback to Monad Cafe
  }

  // Check if wallet already reviewed this venue
  const cleanWallet = newReview.wallet_address.toLowerCase();
  const existingIdx = targetVenue.reviews.findIndex(r => r.wallet_address.toLowerCase() === cleanWallet);
  const isNewReview = existingIdx === -1;

  if (existingIdx >= 0) {
    // Update existing review (prevent spamming multiple reviews)
    targetVenue.reviews[existingIdx] = {
      ...targetVenue.reviews[existingIdx],
      ...newReview,
      id: targetVenue.reviews[existingIdx].id, // preserve review ID
      created_at: new Date().toISOString(),
    };
  } else {
    // Insert new review & increment review count
    targetVenue.reviews.unshift(newReview);
    targetVenue.reviews_count = (targetVenue.reviews_count || targetVenue.reviews.length) + 1;
  }

  return { venue: targetVenue, review: newReview, isNewReview };
}

/**
 * Dynamically anchors Monad Cafe & Roastery to the user's current GPS coordinates
 * (so it is instantly verified in-venue) and positions Neon Roast & Bistro ~2.3 km away
 * (so it is visible on Discover but strictly outside the 250m review geofence).
 */
export function syncMonadCafeToLocation(lat: number, lng: number) {
  for (const v of liveVenues) {
    if (v.id === 'venue-monad-cafe' || v.name.toLowerCase().includes('monad cafe')) {
      v.latitude = lat;
      v.longitude = lng;
    } else if (v.id === 'venue-neon-bistro' || v.name.toLowerCase().includes('neon roast')) {
      v.latitude = lat + 0.016;
      v.longitude = lng + 0.014;
    }
  }
}

