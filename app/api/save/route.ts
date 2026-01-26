import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { telegram_id, username, bux, followers, clout, game_state } = body;

        // Basic validation
        if (!telegram_id) {
            return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
        }

        // Upsert user data
        const { data, error } = await supabase
            .from('users')
            .upsert(
                {
                    telegram_id,
                    username,
                    bux,
                    followers,
                    clout,
                    game_state,
                    last_login: new Date().toISOString(),
                },
                { onConflict: 'telegram_id' }
            )
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Save API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
