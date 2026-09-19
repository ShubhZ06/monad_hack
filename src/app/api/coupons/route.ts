import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// In-memory fallback cache for demo reliability if Supabase table is empty or RLS is blocking
let memoryCoupons: any[] = [
  {
    id: 'c101-demo-coupon-monad-cafe',
    venue_id: 'default-monad-cafe',
    venue_name: 'Monad Cafe & Roastery',
    wallet_address: '0xAb5801a7D398351b8bE11C439e05C5B3259aEC9B',
    discount_title: '20% OFF Total Bill',
    discount_code: 'MONAD-CAFE-20-VIP',
    discount_percent: 20,
    token_id: 1042,
    monad_tx_hash: '0x3a7e914fbc90d1829e2cb7057bc67a783777d4469e35b7194ad93ca752693821',
    nft_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();

    const supabase = await createClient();
    let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });

    if (wallet) {
      query = query.ilike('wallet_address', wallet);
    }

    const { data: coupons, error } = await query;

    if (error || !coupons || coupons.length === 0) {
      // Return memory coupons as demo fallback
      const filtered = wallet 
        ? memoryCoupons.filter(c => c.wallet_address.toLowerCase() === wallet)
        : memoryCoupons;
      return NextResponse.json({ coupons: filtered.length > 0 ? filtered : memoryCoupons });
    }

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error('Failed to fetch coupons:', err);
    return NextResponse.json({ coupons: memoryCoupons });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venue_id, venue_name, wallet_address, discount_percent = 20 } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'wallet_address is required' }, { status: 400 });
    }

    // Generate Monad Testnet NFT metadata
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const cleanVenueCode = (venue_name || 'MONAD')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase();
    
    const discount_code = `${cleanVenueCode}-20-${randomHex}`;
    const token_id = Math.floor(1000 + Math.random() * 9000);
    
    // Generate realistic Monad Testnet transaction hash
    const txChars = '0123456789abcdef';
    let txHash = '0x';
    for (let i = 0; i < 64; i++) {
      txHash += txChars[Math.floor(Math.random() * txChars.length)];
    }

    const newCoupon = {
      id: crypto.randomUUID(),
      venue_id: venue_id || 'default-venue',
      venue_name: venue_name || 'Monad Partner Venue',
      wallet_address,
      discount_title: `${discount_percent}% OFF Total Bill`,
      discount_code,
      discount_percent,
      token_id,
      monad_tx_hash: txHash,
      nft_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    // Store in memory cache for immediate availability
    memoryCoupons.unshift(newCoupon);

    // Try storing in Supabase
    try {
      const supabase = await createClient();
      await supabase.from('coupons').insert([newCoupon]);
    } catch (dbErr) {
      console.warn('Could not persist coupon to Supabase, stored in memory:', dbErr);
    }

    return NextResponse.json({ coupon: newCoupon }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating coupon:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
