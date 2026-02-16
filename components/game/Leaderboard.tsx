'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwxuamrbztltmdvtmmeb.supabase.co';
const supabaseKey = 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O';
const supabase = createClient(supabaseUrl, supabaseKey);

interface LeaderboardProps {
  currentBux: number;
  currentClout: number;
  playerName?: string;
}

interface LeaderboardEntry {
  id: number;
  player_name: string;
  bux: number;
  clout: number;
  created_at: string;
}

export default function Leaderboard({ currentBux, currentClout, playerName = 'You' }: LeaderboardProps) {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('23:59:59');
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnEntry, setIsOwnEntry] = useState(false);

  const format = (n: number): string => {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toLocaleString();
  };

  const calculateScore = (bux: number, clout: number) => bux + clout * 10000000;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      
      // Only save score on initial load - use localStorage to track per username
      const saveKey = `lb_saved_${playerName}_${Math.floor(currentBux / 1000000)}`; // Key includes bux range to allow updates on significant gains
      if (playerName && currentBux > 0) {
        try {
          // Check and update/insert - this is atomic-ish
          const checkRes = await fetch(
            `https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard?player_name=eq.${encodeURIComponent(playerName)}&limit=1`,
            {
              headers: {
                'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O'
              }
            }
          );
          const existing = await checkRes.json();
          
          if (existing && existing.length > 0) {
            // Only update if score is higher
            if (currentBux > existing[0].bux) {
              await fetch(
                `https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard?player_name=eq.${encodeURIComponent(playerName)}`,
                {
                  method: 'PATCH',
                  headers: {
                    'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                    'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ bux: currentBux, clout: currentClout })
                }
              );
            }
          } else {
            // Insert new only if doesn't exist
            await fetch('https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard', {
              method: 'POST',
              headers: {
                'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                player_name: playerName,
                bux: currentBux,
                clout: currentClout
              })
            });
          }
        } catch (e) { console.error('Failed to save score:', e); }
      }
      
      // Now fetch updated leaderboard - only show players with clout (real players who prestiged)
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .gt('clout', 0)  // Only show real players who have prestiged
        .order('bux', { ascending: false })
        .limit(20);

      if (!error && data) {
        // Mark if player is in the list
        const playerIndex = data.findIndex(p => p.player_name === playerName);
        setIsOwnEntry(playerIndex >= 0);
        
        // Deduplicate by player_name - keep highest score for each
        const deduped = data.reduce((acc: LeaderboardEntry[], p) => {
          const existing = acc.find(x => x.player_name === p.player_name);
          if (!existing || p.bux > existing.bux) {
            return [...acc.filter(x => x.player_name !== p.player_name), p];
          }
          return acc;
        }, []);
        
        // Sort by bux descending
        deduped.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.bux - a.bux);
        
        setPlayers(deduped);
        
        // Calculate user rank
        const userScore = calculateScore(currentBux, currentClout);
        let rank: number | null = null;
        for (let i = 0; i < data.length; i++) {
          const playerScore = calculateScore(data[i].bux, data[i].clout);
          if (userScore > playerScore) {
            rank = i + 1;
            break;
          }
        }
        if (!rank && data.length > 0) {
          rank = data.length + 1;
        } else if (!rank) {
          rank = 1;
        }
        setUserRank(rank);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, []); // Only run once when leaderboard opens

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-yellow-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">🏆 LEADERBOARD</h3>
        <div className="text-xs text-gray-400">Resets in {timeLeft}</div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-4">Loading...</div>
      ) : players.length === 0 ? (
        <div className="text-center text-gray-400 py-4">No players yet. Be the first!</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-2 mb-4">
            {players.slice(0, 3).map((p, i) => (
              <div key={p.id} className={`text-center p-2 rounded ${i === 0 ? 'bg-yellow-900/30' : i === 1 ? 'bg-gray-700/30' : 'bg-orange-900/30'} ${p.player_name === playerName ? 'border-2 border-blue-500' : ''}`}>
                <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <div className="text-xs text-white font-bold truncate w-16">{p.player_name}</div>
                {p.player_name === playerName && <div className="text-blue-300 text-xs">(You)</div>}
                <div className="text-xs text-green-400">{format(p.bux)}</div>
              </div>
            ))}
          </div>

          {/* Rest of list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {players.slice(3).map((p, idx) => (
              <div key={p.id} className={`flex justify-between items-center p-2 rounded text-sm ${p.player_name === playerName ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-800/50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-6">{idx + 4}</span>
                  <span className="text-white">{p.player_name}</span>
                  {p.player_name === playerName && <span className="text-blue-300 text-xs">(You)</span>}
                </div>
                <span className="text-green-400 font-mono">{format(p.bux)}</span>
              </div>
            ))}
          </div>

          {/* User position if not in top 20 */}
          {userRank && userRank > 20 && (
            <div className="mt-4 p-2 rounded bg-blue-900/50 border border-blue-500">
              <div className="flex justify-between items-center">
                <span className="text-blue-300">Your Rank: #{userRank}</span>
                <span className="text-white font-bold">{playerName}</span>
                <span className="text-green-400 font-mono">{format(currentBux)}</span>
              </div>
            </div>
          )}
          {userRank && userRank <= 20 && (
            <div className="mt-4 p-2 rounded bg-blue-900/30 border border-blue-500">
              <div className="flex justify-between items-center">
                <span className="text-blue-300">Your Rank</span>
                <span className="text-white font-bold">#{userRank}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
