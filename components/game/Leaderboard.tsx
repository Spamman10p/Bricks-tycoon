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
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('bux', { ascending: false })
        .limit(20);

      if (!error && data) {
        setPlayers(data);
        
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
  }, [currentBux, currentClout]);

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
              <div key={p.id} className={`text-center p-2 rounded ${i === 0 ? 'bg-yellow-900/30' : i === 1 ? 'bg-gray-700/30' : 'bg-orange-900/30'}`}>
                <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <div className="text-xs text-white font-bold truncate w-16">{p.player_name}</div>
                <div className="text-xs text-green-400">{format(p.bux)}</div>
              </div>
            ))}
          </div>

          {/* Rest of list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {players.slice(3).map((p) => (
              <div key={p.id} className="flex justify-between items-center p-2 rounded bg-gray-800/50 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-6">{p.id}</span>
                  <span className="text-white">{p.player_name}</span>
                </div>
                <span className="text-green-400 font-mono">{format(p.bux)}</span>
              </div>
            ))}
          </div>

          {/* User position */}
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
