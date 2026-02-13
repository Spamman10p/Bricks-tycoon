import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseClient';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || !BOT_TOKEN;

// Helper to validate Telegram data
const validateTelegramWebAppData = (initData: string) => {
    if (!BOT_TOKEN) return false; // Fail safe
    if (DEV_MODE) return true; // Bypass in dev

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const v = Array.from(urlParams.entries());
    v.sort((a, b) => a[0].localeCompare(b[0]));
    
    const dataCheckString = v.map(([key, value]) => `${key}=${value}`).join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
};

// Anti-Cheat Constants
const BUFFER_MULTIPLIER = 1.2; // Allow 20% buffer for lag/rounding
const MAX_CLICKS_PER_SEC = 20; // Human limit

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { telegram_id, username, bux, followers, clout, game_state, initData } = body;

        // 1. Auth Validation
        if (!telegram_id) {
            return NextResponse.json({ error: 'Missing telegram_id' }, { status: 400 });
        }

        // Validate Signature (Skip if missing token in dev, but warn)
        if (BOT_TOKEN && initData) {
            const isValid = validateTelegramWebAppData(initData);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid Auth Signature' }, { status: 403 });
            }
        } 
        // Only allow skipping validation if explicitly in DEV_MODE with no token
        else if (!DEV_MODE) {
             // In Prod, initData is mandatory
             if (!initData) return NextResponse.json({ error: 'Missing initData' }, { status: 401 });
        }

        // 2. Fetch Current State from DB using SERVICE ROLE (bypass RLS) to ensure we get truth
        if (!supabaseAdmin) {
            console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        
        const { data: currentUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('telegram_id', telegram_id)
            .single();

        // 3. Anti-Cheat: Time Bucket & Cap Verification
        if (currentUser && !DEV_MODE) {
            // Calculate Time Delta
            const lastLogin = new Date(currentUser.last_login).getTime();
            const now = Date.now();
            const timeDiffSec = (now - lastLogin) / 1000;

            if (timeDiffSec > 0) {
                const prevBux = currentUser.bux || 0;
                const earned = bux - prevBux;

                // If user accidentally sends stale data or no gain, it's fine. Only check massive gains.
                if (earned > 0) {
                    // Re-calculate Max IPS from DB state (or current payload if we trust it slightly more for 'current' ownership)
                    // Ideally we should use DB state 'upgrades' to calc IPS, but for now let's use the payload's state 
                    // assuming they might have JUST bought an upgrade. 
                    // We calculate MAX POSSIBLE as: (Current IPS * Time) + (Max Clicks * Max Click Val * Time)
                    
                    // Simple heuristic: 
                    // We don't have full game logic here to calc exact IPS safely without duplicating code.
                    // STRATEGY: We will trust the reported Bux IF it's within a generous "Physically Possible" bucket.
                    
                    // Assume Max possible IPS for where they are roughly implies they couldn't have earned 1B in 10s if they only had 100 followers.
                    // This is complex to perfect. For Step 1, we will just Log it.
                    
                    // console.log(`[AntiCheat] User ${username} earned ${earned} in ${timeDiffSec}s`);
                }
            }
        }

        // 4. Upsert with Service Role (secure)
        const { data, error } = await supabaseAdmin
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
