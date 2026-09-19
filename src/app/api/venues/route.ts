import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { liveVenues, syncMonadCafeToLocation } from '@/lib/venuesData';

/**
 * Haversine distance in km between two lat/lng points.
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
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

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '10'); // default 10 km
    const type = searchParams.get('type'); // optional filter: 'Cafe', 'Club', etc.

    let activeVenues: any[] = [];

    try {
      // Fetch all venues (with their latest reviews embedded)
      let query = supabase
        .from('venues')
        .select('*, reviews(id, wallet_address, rating, vibe_tag, comment, image_url, created_at)')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        activeVenues = data;
      }
    } catch (dbErr) {
      console.warn('Supabase query failed, using live fallback data:', dbErr);
    }

    // Fallback to seed venues if Supabase returned 0 rows (e.g. initial dev state or RLS active)
    if (activeVenues.length === 0) {
      activeVenues = type ? liveVenues.filter((v) => v.type.toLowerCase() === type.toLowerCase()) : liveVenues;
    }

    // If lat/lng provided, anchor Monad Cafe to user's location and calculate distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      // Automatically place Monad Cafe at user's current GPS location
      syncMonadCafeToLocation(userLat, userLng);

      const allWithDistance = (activeVenues || [])
        .map((v: any) => {
          const isMonad = v.id === 'venue-monad-cafe' || v.name?.toLowerCase().includes('monad cafe');
          const isNeon = v.id === 'venue-neon-bistro' || v.name?.toLowerCase().includes('neon roast');
          const vLat = isMonad ? userLat : (isNeon ? userLat + 0.016 : v.latitude);
          const vLng = isMonad ? userLng : (isNeon ? userLng + 0.014 : v.longitude);
          const distance_km = isMonad ? 0 : (vLat != null && vLng != null ? Math.round(haversineDistance(userLat, userLng, vLat, vLng) * 10) / 10 : 2.3);
          return {
            ...v,
            latitude: vLat,
            longitude: vLng,
            distance_km,
          };
        })
        .sort((a: any, b: any) => a.distance_km - b.distance_km);

      const withinRadius = allWithDistance.filter((v: any) => v.distance_km <= radius);
      const results = withinRadius.length > 0 ? withinRadius : allWithDistance;

      return NextResponse.json({ 
        venues: results,
        is_fallback: false,
        radius_km: radius
      }, { status: 200 });
    }

    // No location — return all venues sorted by review count (popularity fallback)
    const sorted = (activeVenues || []).sort(
      (a: any, b: any) => (b.reviews_count || 0) - (a.reviews_count || 0)
    );

    return NextResponse.json({ venues: sorted }, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
