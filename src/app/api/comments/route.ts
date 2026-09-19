import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('event_id');

  if (!eventId) {
    return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch comments for a specific event
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_id, wallet_address, content } = body;

  if (!event_id || !wallet_address || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .insert([{ event_id, wallet_address, content }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}
