import { NextResponse } from 'next/server';

const HELIUS_BASE = 'https://api.helius.xyz';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
    }

    // Query Helius for NFTs
    const nftsUrl = `${HELIUS_BASE}/v0/addresses/?api-key=${apiKey}`;
    const nftsResponse = await fetch(nftsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        addresses: [walletAddress],
        displayOptions: { showFungible: false } // NFTs only
      })
    });

    if (!nftsResponse.ok) {
      throw new Error(`Helius API error: ${nftsResponse.status}`);
    }

    const nftsData = await nftsResponse.json();
    
    // Query Helius for tokens
    const tokensUrl = `${HELIUS_BASE}/v0/tokens/?api-key=${apiKey}&address=${walletAddress}`;
    const tokensResponse = await fetch(tokensUrl);
    const tokensData = await tokensResponse.json();

    // Format response
    const nfts = nftsData.result || [];
    const tokens = tokensData.result || [];

    // Calculate rewards based on holdings
    const rewards = calculateRewards(nfts, tokens);

    return NextResponse.json({
      wallet: walletAddress,
      nfts: nfts.length,
      tokens: tokens.length,
      nftDetails: nfts.map((nft: any) => ({
        mint: nft.mintAddress,
        name: nft.name,
        image: nft.imageUrl
      })),
      tokenDetails: tokens.map((token: any) => ({
        mint: token.mintAddress,
        amount: token.amount,
        decimals: token.decimals
      })),
      rewards
    });

  } catch (error) {
    console.error('NFT API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

function calculateRewards(nfts: any[], tokens: any[]) {
  let rewardBux = 0;
  let rewardClout = 0;

  // NFT holder rewards
  if (nfts.length > 0) {
    rewardBux += nfts.length * 1000; // 1000 bux per NFT
    rewardClout += Math.min(nfts.length, 5); // Max 5 clout from NFTs
  }

  // Token holder rewards (if holding our token)
  const tokenHolding = tokens.reduce((sum, t) => sum + (t.amount / Math.pow(10, t.decimals || 0)), 0);
  if (tokenHolding > 0) {
    rewardBux += Math.floor(tokenHolding * 100); // 100 bux per token
    rewardClout += Math.min(Math.floor(tokenHolding / 100), 3); // Max 3 clout from tokens
  }

  return {
    bux: rewardBux,
    clout: rewardClout,
    reason: nfts.length > 0 ? `${nfts.length} NFTs detected` : 'No NFTs'
  };
}
