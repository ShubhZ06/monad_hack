import { NextRequest, NextResponse } from 'next/server';
import { getSortedBidsForEvent, submitOrUpdateBid, DEMO_BIDDING_EVENT } from '@/lib/bidsData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event_id') || DEMO_BIDDING_EVENT.id;

  const sortedBids = getSortedBidsForEvent(eventId);

  return NextResponse.json({
    event_id: eventId,
    bids: sortedBids,
    total_bids: sortedBids.length,
    current_leader: sortedBids[0] || null,
    min_charge_inr: sortedBids[0]?.price_per_head_inr || null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      vendor_wallet,
      vendor_name,
      price_per_head_inr,
      proposal_pitch,
      services_included,
      participation_fee_mon,
      participation_fee_tx,
    } = body;

    if (!event_id || !vendor_wallet || !price_per_head_inr) {
      return NextResponse.json(
        { error: 'Missing required bid fields (event_id, vendor_wallet, price_per_head_inr)' },
        { status: 400 }
      );
    }

    const priceNum = Number(price_per_head_inr);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: 'Price per head must be a positive number in INR' },
        { status: 400 }
      );
    }

    const targetHeadcount = DEMO_BIDDING_EVENT.target_headcount || 50;
    const totalInr = priceNum * targetHeadcount;
    // 1 MON approx ₹8,000 for realistic testnet conversion
    const monEquivalent = parseFloat((priceNum / 8000).toFixed(2));

    const result = submitOrUpdateBid({
      event_id,
      vendor_id: `vendor-${vendor_wallet.slice(2, 6)}`,
      vendor_wallet,
      vendor_name: vendor_name || `Vendor_${vendor_wallet.slice(-4)}`,
      participation_fee_mon: Number(participation_fee_mon) || 0.05,
      participation_fee_tx: participation_fee_tx || `0x${Math.random().toString(16).slice(2)}`,
      price_per_head_inr: priceNum,
      total_amount_inr: totalInr,
      mon_equivalent: monEquivalent,
      proposal_pitch: proposal_pitch || 'Official vendor proposal with full equipment and staff.',
      services_included: services_included || ['Production', 'Sound', 'Staff'],
    });

    return NextResponse.json({
      success: true,
      message:
        result.rank === 1
          ? '🔥 You have taken the #1 spot on the Leaderboard with the Minimum Charge!'
          : `Bid recorded at Rank #${result.rank}. Re-quote to undercut Rank #1!`,
      bid: result.bid,
      is_new_bid: result.isNew,
      new_rank: result.rank,
      total_bids: result.sortedBids.length,
      leaderboard: result.sortedBids,
    });
  } catch (error: any) {
    console.error('Bid submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit bid' }, { status: 500 });
  }
}
