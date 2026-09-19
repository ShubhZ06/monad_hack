// In-memory fallback and state management for Vendor Bidding Arena & Leaderboard Fight

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
  title: 'Neon Nights Rooftop Rave & Hackathon Afterparty',
  description: '50 verified Monad builders have voted "I am in"! Community is seeking competitive vendor proposals to host the official hackathon rooftop afterparty with stage, lighting, sound, and beverage vouchers. Entry fee: 0.05 MON. Lowest INR charge wins the organizer contract!',
  organizer_name: 'Monad Builders DAO',
  state: 'BIDDING',
  indicative_price: 1500,
  currency: 'INR',
  target_headcount: 50,
  current_headcount: 50, // 100% quorum reached!
  event_date: 'Oct 25, 2026',
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
    total_completed_events: 18,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'vendor-2',
    wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    business_name: 'CyberBass DJ & Sound Collective',
    category: 'DJ & Sound System',
    description: 'Underground bass, resident DJs, Pioneer CDJ-3000 setups, and atmospheric smoke.',
    rating: 4.9,
    total_completed_events: 24,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'vendor-3',
    wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    business_name: 'Monad Rooftop Collective',
    category: 'Venue & Rooftop Experience',
    description: 'Premium rooftop experience, 360 skyline views, cocktail bar, and full audio/security.',
    rating: 5.0,
    total_completed_events: 31,
    is_verified: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// 3. Initial Competing Bids (Ranked by Reverse Auction: Lowest price wins Rank #1)
export const SEED_BIDS: VendorBid[] = [
  {
    id: 'bid-1',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-1',
    vendor_wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    vendor_name: 'Neon Horizon Productions',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    price_per_head_inr: 1450,
    total_amount_inr: 72500,
    mon_equivalent: 0.18,
    proposal_pitch: 'We will bring our custom truss lighting, dual laser projectors, high-definition PA system, and custom glowing neon entry wristbands for all 50 builders.',
    services_included: ['Audio Engineering', '4K Projection', 'Neon Wristbands', 'Setup & Teardown'],
    revision_count: 1,
    status: 'OUTBID',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'bid-2',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-2',
    vendor_wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    vendor_name: 'CyberBass DJ & Sound Collective',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    price_per_head_inr: 1250,
    total_amount_inr: 62500,
    mon_equivalent: 0.15,
    proposal_pitch: 'Live B2B DJ set featuring 2 resident artists, 18-inch subwoofers for chest-thumping bass, laser haze machines, and full soundcheck before doors open.',
    services_included: ['2 Resident DJs', 'Subwoofer Array', 'Laser & Haze Machine', 'Pro Sound Engineer'],
    revision_count: 2,
    status: 'OUTBID',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'bid-3',
    event_id: 'event-neon-nights-bidding',
    vendor_id: 'vendor-3',
    vendor_wallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    vendor_name: 'Monad Rooftop Collective',
    participation_fee_mon: 0.05,
    participation_fee_tx: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    price_per_head_inr: 1100, // Champion bid
    total_amount_inr: 55000,
    mon_equivalent: 0.14,
    proposal_pitch: 'Complete package! Private rooftop terrace access overlooking Mumbai skyline, pro sound rig, 2 resident DJs, 2 drink coupons per attendee, and professional security staff.',
    services_included: ['Private Rooftop Venue', '2 Resident DJs', 'Pro Sound Rig', '2 Drink Coupons / Head', 'Security Staff'],
    revision_count: 3,
    status: 'ACTIVE', // Rank #1 leader
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// In-memory mutable arrays during server runtime
export let liveVendors: VendorProfile[] = JSON.parse(JSON.stringify(SEED_VENDORS));
export let liveBids: VendorBid[] = JSON.parse(JSON.stringify(SEED_BIDS));

// Helper: Get bids for an event sorted strictly by minimum charge (Reverse Auction)
export function getSortedBidsForEvent(eventId: string): VendorBid[] {
  const matches = liveBids.filter(b => b.event_id === eventId);
  return matches.sort((a, b) => a.price_per_head_inr - b.price_per_head_inr);
}

// Helper: Check if a wallet has paid participation fee
export function hasPaidParticipationFee(walletAddress: string, eventId: string): boolean {
  const clean = walletAddress.toLowerCase();
  return liveBids.some(b => b.vendor_wallet.toLowerCase() === clean && b.event_id === eventId);
}

// Helper: Submit or manipulate a bid (Leaderboard Fight)
export function submitOrUpdateBid(payload: {
  event_id: string;
  vendor_wallet: string;
  vendor_name: string;
  price_per_head_inr: number;
  proposal_pitch: string;
  services_included: string[];
  tx_hash?: string;
}): { bid: VendorBid; isNewBid: boolean; newRank: number; totalBids: number } {
  const cleanWallet = payload.vendor_wallet.toLowerCase();
  const existingIdx = liveBids.findIndex(
    b => b.event_id === payload.event_id && b.vendor_wallet.toLowerCase() === cleanWallet
  );

  const totalHeadcount = 50;
  const totalAmountInr = payload.price_per_head_inr * totalHeadcount;
  // Peg rate: 1 MON = ₹8,000 for realistic demo display
  const monEquivalent = Math.round((payload.price_per_head_inr / 8000) * 100) / 100;

  let savedBid: VendorBid;
  let isNewBid = false;

  if (existingIdx >= 0) {
    // Update existing bid (Leaderboard Fight manipulation)
    const prev = liveBids[existingIdx];
    savedBid = {
      ...prev,
      price_per_head_inr: payload.price_per_head_inr,
      total_amount_inr: totalAmountInr,
      mon_equivalent: monEquivalent,
      proposal_pitch: payload.proposal_pitch || prev.proposal_pitch,
      services_included: payload.services_included.length > 0 ? payload.services_included : prev.services_included,
      revision_count: prev.revision_count + 1,
      updated_at: new Date().toISOString(),
    };
    liveBids[existingIdx] = savedBid;
  } else {
    // First-time bid submission with 0.05 MON entry fee
    isNewBid = true;
    savedBid = {
      id: `bid-${Date.now()}`,
      event_id: payload.event_id,
      vendor_id: `vendor-${Date.now()}`,
      vendor_wallet: payload.vendor_wallet,
      vendor_name: payload.vendor_name || 'Verified Monad Vendor',
      participation_fee_mon: 0.05,
      participation_fee_tx: payload.tx_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      price_per_head_inr: payload.price_per_head_inr,
      total_amount_inr: totalAmountInr,
      mon_equivalent: monEquivalent,
      proposal_pitch: payload.proposal_pitch,
      services_included: payload.services_included,
      revision_count: 1,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    liveBids.push(savedBid);
  }

  // Recalculate status for all bids on this event
  const sorted = getSortedBidsForEvent(payload.event_id);
  sorted.forEach((bid, index) => {
    bid.status = index === 0 ? 'ACTIVE' : 'OUTBID';
  });

  const newRank = sorted.findIndex(b => b.id === savedBid.id) + 1;

  // Update demo event lowest bid
  if (sorted.length > 0) {
    DEMO_BIDDING_EVENT.min_bid_inr = sorted[0].price_per_head_inr;
    DEMO_BIDDING_EVENT.bids_count = sorted.length;
  }

  return {
    bid: savedBid,
    isNewBid,
    newRank,
    totalBids: sorted.length,
  };
}
