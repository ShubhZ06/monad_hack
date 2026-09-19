import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  // Fetch all communities
  const { data: communities, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ communities });
}
