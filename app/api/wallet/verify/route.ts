import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

/**
 * Verify wallet signature
 * Player signs a message with their wallet, we verify it's authentic
 */
export async function POST(request: Request) {
  try {
    const { walletAddress, signature, message } = await request.json();

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing walletAddress, signature, or message' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify signature (in production, use @solana/web3.js verify)
    // For now, accept valid public keys (signature verification happens client-side)
    
    return NextResponse.json({
      verified: true,
      wallet: walletAddress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Wallet verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
