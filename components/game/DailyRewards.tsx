'use client';

import { useState, useEffect, useCallback } from 'react';

interface DailyRewardsProps {
  lastClaim: string | null;
  streak: number;
  onClaim: (day: number) => void;
}

const REWARDS = [100, 250, 500, 1000, 2500, 5000, 10000];
const CLAIM_COOLDOWN_HOURS = 20;
const CLAIM_COOLDOWN_MS = CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000;

export function DailyRewards({ lastClaim, streak, onClaim }: DailyRewardsProps) {
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const [canClaim, setCanClaim] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(streak);

  const formatTimeRemaining = useCallback((ms: number): string => {
    if (ms <= 0) return '0h 0m';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }, []);

  const checkClaimStatus = useCallback(() => {
    if (!lastClaim) {
      setCanClaim(true);
      setTimeUntilNextClaim('');
      return;
    }

    const lastClaimTime = new Date(lastClaim).getTime();
    const now = Date.now();
    const timeSinceClaim = now - lastClaimTime;
    const timeRemaining = CLAIM_COOLDOWN_MS - timeSinceClaim;

    if (timeRemaining <= 0) {
      setCanClaim(true);
      setTimeUntilNextClaim('');
    } else {
      setCanClaim(false);
      setTimeUntilNextClaim(formatTimeRemaining(timeRemaining));
    }
  }, [lastClaim, formatTimeRemaining]);

  useEffect(() => {
    setCurrentStreak(streak);
  }, [streak]);

  useEffect(() => {
    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [checkClaimStatus]);

  const handleClaim = () => {
    if (!canClaim) return;
    const nextDay = (currentStreak % 7);
    onClaim(nextDay);
    setCurrentStreak(nextDay + 1);
    setCanClaim(false);
  };

  const getDayStatus = (dayIndex: number): 'claimed' | 'available' | 'locked' => {
    if (dayIndex < currentStreak % 7) {
      return 'claimed';
    }
    if (dayIndex === currentStreak % 7 && canClaim) {
      return 'available';
    }
    if (dayIndex === currentStreak % 7 && !canClaim) {
      return 'locked';
    }
    return 'locked';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-yellow-400 uppercase pixel-font tracking-wider mb-1">
          Daily Rewards
        </h2>
        <p className="text-gray-400 text-xs">
          Streak: <span className="text-yellow-400 font-bold">{Math.floor(currentStreak / 7) * 7 + (currentStreak % 7)}</span> days
        </p>
      </div>

      {/* 7-Day Grid */}
      <div className="glass-panel rounded-2xl border border-yellow-500/30 bg-black/60 p-4 mb-4">
        <div className="grid grid-cols-7 gap-2">
          {REWARDS.map((reward, index) => {
            const status = getDayStatus(index);
            const isLastDay = index === 6;

            return (
              <div
                key={index}
                className={`
                  relative aspect-square rounded-lg flex flex-col items-center justify-center text-center
                  transition-all duration-200
                  ${status === 'claimed'
                    ? 'bg-green-600/30 border border-green-500/50'
                    : status === 'available'
                    ? 'bg-yellow-500/20 border border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse'
                    : 'bg-black/40 border border-gray-700 opacity-60'
                  }
                  ${isLastDay ? 'ring-1 ring-yellow-500/50' : ''}
                `}
              >
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                  Day {index + 1}
                </span>
                <span className={`text-sm font-bold ${status === 'claimed' ? 'text-green-400' : 'text-white'}`}>
                  ${reward.toLocaleString()}
                </span>
                {status === 'claimed' && (
                  <span className="absolute top-0.5 right-0.5 text-green-400 text-[10px]">✓</span>
                )}
                {status === 'available' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
            <span>Progress</span>
            <span>{currentStreak % 7}/7 Days</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-300"
              style={{ width: `${((currentStreak % 7) / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Claim Button & Timer */}
      <div className="glass-panel rounded-xl border border-gray-700 bg-black/60 p-4">
        {canClaim ? (
          <button
            onClick={handleClaim}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-95"
          >
            <span className="pixel-font">Claim Day {((currentStreak % 7) + 1)} Reward</span>
          </button>
        ) : (
          <div className="text-center">
            <button
              disabled
              className="w-full py-3 px-6 rounded-lg bg-gray-800 text-gray-500 font-bold uppercase tracking-wider cursor-not-allowed opacity-60"
            >
              <span className="pixel-font">Claimed</span>
            </button>
            {timeUntilNextClaim && (
              <p className="text-gray-400 text-xs mt-3">
                Next claim in <span className="text-yellow-400 font-mono">{timeUntilNextClaim}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-center text-gray-500 text-[10px] mt-3">
        Complete 7 days to start a new streak cycle!
      </p>
    </div>
  );
}

export default DailyRewards;
