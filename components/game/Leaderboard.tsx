'use client';

import { useState, useEffect } from 'react';

interface LeaderboardProps {
  currentBux: number;
  currentClout: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  bux: number;
  clout: number;
}

const MOCK_PLAYERS: LeaderboardEntry[] = [
  { rank: 1, name: "CryptoKing", bux: 15000000000, clout: 2500 },
  { rank: 2, name: "DiamondHands", bux: 8500000000, clout: 1800 },
  { rank: 3, name: "MoonBoy🚀", bux: 4200000000, clout: 950 },
  { rank: 4, name: "RugPuller", bux: 2100000000, clout: 420 },
  { rank: 5, name: "ToTheMoon", bux: 980000000, clout: 210 },
  { rank: 6, name: "WAGMI", bux: 450000000, clout: 89 },
  { rank: 7, name: "HODLer", bux: 180000000, clout: 42 },
  { rank: 8, name: "PaperHands", bux: 75000000, clout: 15 },
  { rank: 9, name: "Newbie", bux: 12000000, clout: 3 },
  { rank: 10, name: "FomoIn", bux: 3500000, clout: 1 },
];

export default function Leaderboard({ currentBux, currentClout }: LeaderboardProps) {
  const [players, setPlayers] = useState<LeaderboardEntry[]>(MOCK_PLAYERS);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('23:59:59');

  // Format numbers like game
  const format = (n: number): string => {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toLocaleString();
  };

  useEffect(() => {
    // Calculate user rank based on score
    const score = currentBux + currentClout * 10000000;
    let rank = 11;
    for (let i = 0; i < players.length; i++) {
      const playerScore = players[i].bux + players[i].clout * 10000000;
      if (score > playerScore) {
        rank = i + 1;
        break;
      }
    }
    setUserRank(rank);
  }, [currentBux, currentClout, players]);

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

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-2 mb-4">
        {players.slice(0, 3).map((p, i) => (
          <div key={p.rank} className={`text-center p-2 rounded ${i === 0 ? 'bg-yellow-900/30' : i === 1 ? 'bg-gray-700/30' : 'bg-orange-900/30'}`}>
            <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
            <div className="text-xs text-white font-bold truncate w-16">{p.name}</div>
            <div className="text-xs text-green-400">{format(p.bux)}</div>
          </div>
        ))}
      </div>

      {/* Rest of list */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {players.slice(3).map((p) => (
          <div key={p.rank} className="flex justify-between items-center p-2 rounded bg-gray-800/50 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-6">{p.rank + 3}</span>
              <span className="text-white">{p.name}</span>
            </div>
            <span className="text-green-400 font-mono">{format(p.bux)}</span>
          </div>
        ))}
      </div>

      {/* User position */}
      {userRank && userRank <= 10 && (
        <div className="mt-4 p-2 rounded bg-blue-900/30 border border-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-blue-300">Your Rank</span>
            <span className="text-white font-bold">#{userRank}</span>
          </div>
        </div>
      )}
    </div>
  );
}
