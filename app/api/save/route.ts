import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseClient';

// Force dev mode bypass for now
const DEV_MODE = true;

export async function POST(request: Request) {
    
    try {
        const body = await request.json();
        const { telegram_id, username, bux, followers, clout, game_state } = body;

        if (!telegram_id) {
            return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
        }

        // Skip auth in dev mode
        if (!DEV_MODE && !process.env.TELEGRAM_BOT_TOKEN) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        // Use admin client for writes
        const client = supabaseAdmin;
        
        if (!client) {
            // Fallback to regular client if admin not available
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const fallbackClient = createClient(supabaseUrl, supabaseKey);
            
            const { data, error } = await fallbackClient
                .from('users')
                .upsert({
                    telegram_id,
                    username,
                    bux,
                    followers,
                    clout,
                    game_state,
                    last_login: new Date().toISOString(),
                }, { onConflict: 'telegram_id' })
                .select();

            if (error) {
                console.error('Supabase error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true, data });
        }

        const { data, error } = await client
            .from('users')
            .upsert({
                telegram_id,
                username,
                bux,
                followers,
                clout,
                game_state,
                last_login: new Date().toISOString(),
            }, { onConflict: 'telegram_id' })
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Save API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
