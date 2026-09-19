import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { addReviewToMemory, liveVenues, syncMonadCafeToLocation } from '@/lib/venuesData';
import { mintCouponOnChain } from '@/lib/monad/nftMinter';

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venue_id');

    if (!venueId) {
      return NextResponse.json({ error: 'venue_id is required' }, { status: 400 });
    }

    // Fetch all reviews for a specific venue
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venue_id, venue_name, wallet_address, rating, vibe_tag, comment, image_url, user_lat, user_lng, is_simulated } = body;

    // Validate required fields
    if (!venue_id || !wallet_address) {
      return NextResponse.json(
        { error: 'venue_id and wallet_address are required' },
        { status: 400 }
      );
    }

    // Proof of Location Gate: Must be within 250 meters of the venue
    if (!is_simulated && user_lat != null && user_lng != null) {
      if (venue_id === 'venue-monad-cafe' || (venue_name && venue_name.toLowerCase().includes('monad cafe'))) {
        syncMonadCafeToLocation(user_lat, user_lng);
      }

      const targetVenue = liveVenues.find(
        v => v.id === venue_id || (venue_name && v.name.toLowerCase() === venue_name.toLowerCase())
      );
      if (targetVenue && targetVenue.latitude != null && targetVenue.longitude != null) {
        const distKm = haversineDistance(user_lat, user_lng, targetVenue.latitude, targetVenue.longitude);
        const MAX_CHECKIN_KM = 0.25; // 250m max
        if (distKm > MAX_CHECKIN_KM) {
          const metersAway = Math.round(distKm * 1000);
          return NextResponse.json(
            {
              error: `Proof of Location Failed: You are ${metersAway}m away from ${targetVenue.name}. You must be physically within 250m to post a review and earn a coupon.`
            },
            { status: 403 }
          );
        }
      }
    }

    let savedReview: any = {
      id: crypto.randomUUID(),
      venue_id,
      wallet_address,
      rating: Number(rating) || 5,
      vibe_tag: vibe_tag || 'Insane',
      comment: comment || '',
      image_url: image_url || null,
      created_at: new Date().toISOString(),
    };

    // 1. Try Supabase Insert
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            venue_id,
            wallet_address,
            rating: Number(rating) || 5,
            vibe_tag: vibe_tag || 'Insane',
            comment: comment || null,
            image_url: image_url || null,
          },
        ])
        .select();

      if (!error && data && data.length > 0) {
        savedReview = data[0];
      }

      // Try incrementing review count
      try {
        await supabase.rpc('increment_reviews_count', { venue_uuid: venue_id });
      } catch {
        // Best effort
      }
    } catch (dbErr) {
      console.warn('Could not insert to Supabase, falling back to memory store:', dbErr);
    }

    // 2. Add to live in-memory store so it shows immediately on feed
    const { isNewReview } = addReviewToMemory(savedReview, venue_name);

    // 3. Anti-Coupon-Farming Check:
    // A wallet can only claim ONE discount coupon per venue to prevent farming exploits!
    let issuedCoupon: any = null;
    let alreadyClaimed = !isNewReview;

    if (!alreadyClaimed) {
      try {
        const supabase = await createClient();
        const { data: existingCoupons } = await supabase
          .from('coupons')
          .select('id')
          .ilike('wallet_address', wallet_address)
          .eq('venue_id', venue_id)
          .limit(1);

        if (existingCoupons && existingCoupons.length > 0) {
          alreadyClaimed = true;
        }
      } catch {
        // Fallback
      }
    }

    // Only mint a new Monad Testnet NFT coupon if this is a genuine first-time review
    if (!alreadyClaimed) {
      const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
      const cleanVenueCode = (venue_name || 'MONAD')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase();
      
      const discount_code = `${cleanVenueCode}-20-${randomHex}`;

      // Call on-chain ReviewCouponNFT contract on Monad Testnet!
      const mintResult = await mintCouponOnChain(
        wallet_address,
        venue_id,
        venue_name || 'Monad Partner Venue',
        20
      );

      const token_id = mintResult.tokenId;
      const txHash = mintResult.txHash;

      issuedCoupon = {
        id: crypto.randomUUID(),
        venue_id,
        venue_name: venue_name || 'Monad Partner Venue',
        wallet_address,
        discount_title: '20% OFF Total Bill',
        discount_code,
        discount_percent: 20,
        token_id,
        monad_tx_hash: txHash,
        nft_image_url: image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };

      // Try saving coupon to Supabase
      try {
        const supabase = await createClient();
        await supabase.from('coupons').insert([issuedCoupon]);
      } catch (couponDbErr) {
        console.warn('Coupon Supabase save skipped:', couponDbErr);
      }
    }

    return NextResponse.json({
      review: savedReview,
      coupon: issuedCoupon,
      already_claimed: alreadyClaimed,
      is_new_review: isNewReview,
      message: alreadyClaimed
        ? 'Review updated! You have already claimed your 20% NFT discount coupon for this venue.'
        : 'Review posted! 20% OFF Monad Testnet NFT Coupon awarded!',
    }, { status: 201 });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
