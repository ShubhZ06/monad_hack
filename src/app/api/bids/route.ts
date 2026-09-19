import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSortedBidsForEvent, submitOrUpdateBid, liveBids } from '@/lib/bidsData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id') || 'event-neon-nights-bidding';

    let bids: any[] = [];

    // 1. Try Supabase query
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('vendor_bids')
        .select('*')
        .eq('event_id', eventId)
        .order('price_per_head_inr', { ascending: true }); // Reverse auction: lowest charge on top

      if (!error && data && data.length > 0) {
        bids = data;
      }
    } catch (dbErr) {
      console.warn('Supabase query for bids failed, falling back to memory store:', dbErr);
    }

    // 2. Fallback to memory store
    if (bids.length === 0) {
      bids = getSortedBidsForEvent(eventId);
    }

    // Ensure bids are strictly sorted ascending by price (lowest charge = rank 1)
    const sorted = [...bids].sort((a, b) => Number(a.price_per_head_inr) - Number(b.price_per_head_inr));

    return NextResponse.json({
      event_id: eventId,
      bids: sorted,
      total_bids: sorted.length,
      current_leader: sorted[0] || null,
      min_charge_inr: sorted[0]?.price_per_head_inr ?? null,
    }, { status: 200 });
  } catch (err) {
    console.error('Failed to fetch bids:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id = 'event-neon-nights-bidding',
      vendor_wallet,
      vendor_name,
      price_per_head_inr,
      proposal_pitch,
      services_included = [],
      tx_hash,
    } = body;

    if (!vendor_wallet || !price_per_head_inr || price_per_head_inr <= 0) {
      return NextResponse.json(
        { error: 'vendor_wallet and a valid price_per_head_inr are required' },
        { status: 400 }
      );
    }

    // 1. Submit or update in memory store (guarantees immediate instant response & leaderboard re-order)
    const memoryResult = submitOrUpdateBid({
      event_id,
      vendor_wallet,
      vendor_name: vendor_name || 'Verified Monad Vendor',
      price_per_head_inr: Number(price_per_head_inr),
      proposal_pitch: proposal_pitch || 'Custom competitive proposal for this event.',
      services_included: Array.isArray(services_included) ? services_included : [],
      tx_hash,
    });

    // 2. Try persisting to Supabase
    try {
      const supabase = await createClient();
      const { data: existingBid } = await supabase
        .from('vendor_bids')
        .select('id, revision_count')
        .eq('event_id', event_id)
        .eq('vendor_wallet', vendor_wallet)
        .single();

      if (existingBid) {
        await supabase
          .from('vendor_bids')
          .update({
            price_per_head_inr: Number(price_per_head_inr),
            total_amount_inr: Number(price_per_head_inr) * 50,
            mon_equivalent: Math.round((Number(price_per_head_inr) / 8000) * 100) / 100,
            proposal_pitch: proposal_pitch || '',
            services_included,
            revision_count: (existingBid.revision_count || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBid.id);
      } else {
        await supabase.from('vendor_bids').insert([
          {
            event_id,
            vendor_wallet,
            vendor_name: vendor_name || 'Verified Monad Vendor',
            participation_fee_mon: 0.05,
            participation_fee_tx: tx_hash || null,
            price_per_head_inr: Number(price_per_head_inr),
            total_amount_inr: Number(price_per_head_inr) * 50,
            mon_equivalent: Math.round((Number(price_per_head_inr) / 8000) * 100) / 100,
            proposal_pitch: proposal_pitch || '',
            services_included,
            revision_count: 1,
            status: memoryResult.newRank === 1 ? 'ACTIVE' : 'OUTBID',
          },
        ]);
      }
    } catch (dbErr) {
      console.warn('Supabase bid save failed, memory store preserved:', dbErr);
    }

    const updatedLeaderboard = getSortedBidsForEvent(event_id);

    return NextResponse.json({
      success: true,
      message: memoryResult.newRank === 1
        ? '🔥 You have taken the #1 spot on the Leaderboard with the Minimum Charge!'
        : `Bid submitted! You are currently Rank #${memoryResult.newRank}. Drop your price lower to claim #1!`,
      bid: memoryResult.bid,
      is_new_bid: memoryResult.isNewBid,
      new_rank: memoryResult.newRank,
      total_bids: memoryResult.totalBids,
      leaderboard: updatedLeaderboard,
    }, { status: 200 });
  } catch (err) {
    console.error('Bid submission error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
