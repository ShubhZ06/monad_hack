// State management and seed data for Vendor Bidding Arena & Reverse Auction Leaderboard

export interface VendorProfile {
  id: string;
  wallet_address: string;
  business_name: string;
  category: string;
  description: string;
  contact_info?: string;
  website_url?: string;
  rating: number;
  total_completed_events: number;
  is_verified: boolean;
  created_at: string;
}

export interface VendorBid {
  id: string;
  event_id: string;
  vendor_id: string;
  vendor_wallet: string;
  vendor_name: string;
  participation_fee_mon: number;
  participation_fee_tx?: string;
  price_per_head_inr: number;
  total_amount_inr: number;
  mon_equivalent: number;
  proposal_pitch: string;
  services_included: string[];
  revision_count: number;
  status: 'ACTIVE' | 'OUTBID' | 'ACCEPTED';
  created_at: string;
  updated_at: string;
}

export interface DemoEvent {
  id: string;
  title: string;
  description: string;
  organizer_name: string;
  state: 'INTEREST' | 'BIDDING' | 'PLEDGING' | 'LOCKED';
  indicative_price: number;
  currency: string;
  target_headcount: number;
  current_headcount: number;
  event_date: string;
  bids_count: number;
  min_bid_inr?: number;
}

// 1. Demo Event: 100% Fully Voted Event in BIDDING state
export const DEMO_BIDDING_EVENT: DemoEvent = {
  id: 'event-neon-nights-bidding',
  title: 'Neon Nights Hackathon Rave',
  description:
    'Full quorum reached! 50 verified Monad builders have voted 100% YES. Community is seeking competitive vendor proposals to host the official hackathon rooftop afterparty with stage, lighting, sound, and beverage vouchers. Entry fee: 0.05 MON. Lowest INR charge wins the organizer contract!',
  organizer_name: 'Monad Builders DAO',
  state: 'BIDDING',
  indicative_price: 1500,
  currency: 'INR',
  target_headcount: 50,
  current_headcount: 50, // 100% quorum reached!
  event_date: 'Oct 24, 2026',
  bids_count: 3,
  min_bid_inr: 1100,
};

// 2. Initial Competing Vendors
export const SEED_VENDORS: VendorProfile[] = [
  {
    id: 'vendor-1',
    wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    business_name: 'Neon Horizon Productions',
    category: 'Full Production & Audio',
    description: 'Full-service festival stages, 4K visual mapping, and immersive sound setups.',
    rating: 4.8,
    total_completed_events: 14,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vendor-2',
    wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    business_name: 'CyberBass DJ & Sound Collective',
    category: 'DJ & Sound Reinforcement',
    description: 'Underground rave specialists, Funktion-One sound systems, live visualizers.',
    rating: 4.9,
    total_completed_events: 22,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'vendor-3',
    wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    business_name: 'Monad Rooftop Collective',
    category: 'Venue & Hospitality Catering',
    description: 'Exclusive skyline rooftops, beverage management, crowd security, and ambient neon decor.',
    rating: 4.7,
    total_completed_events: 9,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
];

// 3. Initial Competing Bids (Rank #1 is Minimum Charge)
export const SEED_BIDS: VendorBid[] = [
  {
    id: 'bid-3',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-3',
    vendor_wallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    vendor_name: 'Monad Rooftop Collective',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    price_per_head_inr: 1100, // Rank #1 (Lowest charge!)
    total_amount_inr: 55000,
    mon_equivalent: 0.14,
    proposal_pitch:
      'Complete package! Private rooftop terrace access overlooking Mumbai skyline, pro sound rig, 2 resident DJs, 2 drink coupons per attendee, and professional security staff.',
    services_included: [
      'Private Rooftop Venue',
      '2 Resident DJs',
      'Pro Sound Rig',
      '2 Drink Coupons / Head',
      'Security Staff',
    ],
    revision_count: 3,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'bid-2',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-2',
    vendor_wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    vendor_name: 'CyberBass DJ & Sound Collective',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    price_per_head_inr: 1250, // Rank #2
    total_amount_inr: 62500,
    mon_equivalent: 0.15,
    proposal_pitch:
      'Live B2B DJ set featuring 2 resident artists, 18-inch subwoofers for chest-thumping bass, laser haze machines, and full soundcheck before doors open.',
    services_included: [
      '2 Resident DJs',
      'Subwoofer Array',
      'Laser & Haze Machine',
      'Pro Sound Engineer',
    ],
    revision_count: 2,
    status: 'OUTBID',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'bid-1',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-1',
    vendor_wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    vendor_name: 'Neon Horizon Productions',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    price_per_head_inr: 1450, // Rank #3
    total_amount_inr: 72500,
    mon_equivalent: 0.18,
    proposal_pitch:
      'We will bring our custom truss lighting, dual laser projectors, high-definition PA system, and custom glowing neon entry wristbands for all 50 builders.',
    services_included: [
      'Audio Engineering',
      '4K Projection',
      'Neon Wristbands',
      'Setup & Teardown',
    ],
    revision_count: 1,
    status: 'OUTBID',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

// In-memory bid store for live undercutting and reactive UI
let inMemoryBids: VendorBid[] = [...SEED_BIDS];

export function getSortedBidsForEvent(eventId: string): VendorBid[] {
  return inMemoryBids
    .filter((b) => b.event_id === eventId)
    .sort((a, b) => a.price_per_head_inr - b.price_per_head_inr);
}

export function submitOrUpdateBid(
  bidData: Omit<VendorBid, 'id' | 'created_at' | 'updated_at' | 'revision_count' | 'status'>
): { bid: VendorBid; isNew: boolean; rank: number; sortedBids: VendorBid[] } {
  const existingIndex = inMemoryBids.findIndex(
    (b) =>
      b.event_id === bidData.event_id &&
      b.vendor_wallet.toLowerCase() === bidData.vendor_wallet.toLowerCase()
  );

  let resultBid: VendorBid;
  let isNew = false;

  if (existingIndex >= 0) {
    const prev = inMemoryBids[existingIndex];
    resultBid = {
      ...prev,
      ...bidData,
      revision_count: prev.revision_count + 1,
      status: 'ACTIVE',
      updated_at: new Date().toISOString(),
    };
    inMemoryBids[existingIndex] = resultBid;
  } else {
    isNew = true;
    resultBid = {
      ...bidData,
      id: `bid-${Date.now()}`,
      revision_count: 1,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryBids.push(resultBid);
  }

  // Sort ascending by price: lowest charge is Rank #1
  const sorted = getSortedBidsForEvent(bidData.event_id);
  const minPrice = sorted[0]?.price_per_head_inr;

  // Mark all bids higher than minPrice as OUTBID
  inMemoryBids = inMemoryBids.map((b) => {
    if (b.event_id === bidData.event_id) {
      if (b.price_per_head_inr === minPrice) {
        return { ...b, status: 'ACTIVE' };
      } else {
        return { ...b, status: 'OUTBID' };
      }
    }
    return b;
  });

  const updatedSorted = getSortedBidsForEvent(bidData.event_id);
  const rank = updatedSorted.findIndex((b) => b.id === resultBid.id) + 1;

  return {
    bid: resultBid,
    isNew,
    rank,
    sortedBids: updatedSorted,
  };
}
