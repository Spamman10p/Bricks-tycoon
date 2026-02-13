'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletData {
  wallet: string;
  nfts: number;
  tokens: number;
  rewards: {
    bux: number;
    clout: number;
    reason: string;
  };
  nftDetails: Array<{
    mint: string;
    name: string;
    image?: string;
  }>;
}

export function SolanaWallet() {
  const { publicKey, connected, connecting } = useWallet();
  const { connection } = useConnection();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet data when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletData(publicKey.toString());
    } else {
      setWalletData(null);
    }
  }, [connected, publicKey]);

  const fetchWalletData = async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nfts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch wallet data');
      }

      const data = await response.json();
      setWalletData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = () => {
    if (!walletData?.rewards) return;
    
    // Dispatch event to game
    window.dispatchEvent(new CustomEvent('walletRewards', { 
      detail: { 
        bux: walletData.rewards.bux, 
        clout: walletData.rewards.clout 
      } 
    }));
    alert(`Claimed ${walletData.rewards.bux} BUX and ${walletData.rewards.clout} Clout!`);
  };

  // Truncate address for display
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-purple-900/10">
      <h3 className="text-purple-300 font-bold mb-3 text-sm uppercase flex items-center gap-2">
        <span className="text-xl">👛</span> Solana Wallet
      </h3>
      
      {!connected ? (
        <div className="space-y-3">
          <p className="text-gray-400 text-xs">
            Connect your Solana wallet to earn bonuses based on your NFT holdings!
          </p>
          <WalletMultiButton
            className="!w-full !bg-purple-600 !hover:bg-purple-500 !text-white !font-bold !py-3 !rounded-lg !transition-all !flex !items-center !justify-center !gap-2"
          />
          {connecting && (
            <p className="text-yellow-400 text-xs text-center animate-pulse">
              Connecting...
            </p>
          )}
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">
                ✅
              </span>
              <span className="text-white font-mono text-sm">
                {truncateAddress(publicKey?.toString() || '')}
              </span>
            </div>
            <WalletMultiButton
              className="!bg-red-600/80 !hover:bg-red-500 !text-white !text-xs !py-1 !px-3 !rounded"
            />
          </div>

          {loading && (
            <div className="text-center py-4">
              <span className="animate-spin text-2xl">⏳</span>
              <p className="text-gray-400 text-xs mt-2">Scanning wallet...</p>
            </div>
          )}

          {walletData && !loading && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-2 rounded text-center">
                  <div className="text-purple-300 text-2xl font-bold">{walletData.nfts}</div>
                  <div className="text-gray-500 text-xs">NFTs</div>
                </div>
                <div className="bg-black/40 p-2 rounded text-center">
                  <div className="text-purple-300 text-2xl font-bold">{walletData.tokens}</div>
                  <div className="text-gray-500 text-xs">Tokens</div>
                </div>
              </div>

              {walletData.rewards.bux > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded">
                  <p className="text-purple-300 text-xs mb-2">{walletData.rewards.reason}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-400 font-bold">+{walletData.rewards.bux} BUX</span>
                      {walletData.rewards.clout > 0 && (
                        <span className="text-yellow-400 font-bold ml-3">+{walletData.rewards.clout} CL</span>
                      )}
                    </div>
                    <button
                      onClick={claimRewards}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              )}

              {walletData.nftDetails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs">Your NFTs:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {walletData.nftDetails.slice(0, 3).map((nft) => (
                      <div key={nft.mint} className="bg-black/40 p-2 rounded text-center">
                        {nft.image ? (
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-12 object-cover rounded mb-1"
                          />
                        ) : (
                          <div className="w-full h-12 bg-purple-500/20 rounded flex items-center justify-center text-xl mb-1">
                            🎨
                          </div>
                        )}
                        <p className="text-gray-400 text-[10px] truncate">{nft.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
