import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { liveVendors, VendorProfile } from '@/lib/bidsData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ vendors: liveVendors }, { status: 200 });
    }

    const cleanWallet = wallet.toLowerCase();

    // 1. Check Supabase
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('wallet_address', wallet)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ vendor: data, is_vendor: true }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn('Supabase vendor check failed, falling back to memory store:', dbErr);
    }

    // 2. Check memory store
    const matched = liveVendors.find(v => v.wallet_address.toLowerCase() === cleanWallet);

    return NextResponse.json({
      vendor: matched || null,
      is_vendor: Boolean(matched),
    }, { status: 200 });
  } catch (err) {
    console.error('Failed to get vendor:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      wallet_address,
      business_name,
      category = 'Event Organizer',
      description = '',
      contact_info = '',
      website_url = '',
    } = body;

    if (!wallet_address || !business_name) {
      return NextResponse.json(
        { error: 'wallet_address and business_name are required' },
        { status: 400 }
      );
    }

    const newVendor: VendorProfile = {
      id: `vendor-${Date.now()}`,
      wallet_address,
      business_name,
      category,
      description,
      contact_info,
      website_url,
      rating: 5.0,
      total_completed_events: 1,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    // Update memory store
    const existingIdx = liveVendors.findIndex(v => v.wallet_address.toLowerCase() === wallet_address.toLowerCase());
    if (existingIdx >= 0) {
      liveVendors[existingIdx] = { ...liveVendors[existingIdx], ...newVendor, id: liveVendors[existingIdx].id };
    } else {
      liveVendors.push(newVendor);
    }

    // Try Supabase insert
    try {
      const supabase = await createClient();
      await supabase.from('users').upsert({
        wallet_address,
        role: 'VENDOR',
      });
      await supabase.from('vendors').upsert(newVendor);
    } catch (dbErr) {
      console.warn('Supabase vendor upsert failed, preserved in memory:', dbErr);
    }

    return NextResponse.json({
      success: true,
      vendor: newVendor,
      message: 'Vendor profile registered successfully!',
    }, { status: 200 });
  } catch (err) {
    console.error('Vendor registration error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
