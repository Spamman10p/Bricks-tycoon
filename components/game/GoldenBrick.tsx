'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface GoldenBrickProps {
  baseIncome: number;
  onCollect: (amount: number) => void;
}

export const GoldenBrick: React.FC<GoldenBrickProps> = ({ baseIncome, onCollect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [multiplier, setMultiplier] = useState(7);
  const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomPosition = useCallback(() => {
    // Random position within container bounds (leaving padding for visibility)
    const padding = 15;
    return {
      x: padding + Math.random() * (100 - padding * 2),
      y: padding + Math.random() * (60 - padding * 2),
    };
  }, []);

  const spawnGoldenBrick = useCallback(() => {
    const newMultiplier = Math.floor(Math.random() * 24) + 7; // 7-30x
    setMultiplier(newMultiplier);
    setPosition(getRandomPosition());
    setTimeLeft(10);
    setIsVisible(true);
  }, [getRandomPosition]);

  const scheduleNextSpawn = useCallback(() => {
    const delay = Math.random() * 3 * 60 * 1000 + 2 * 60 * 1000; // 2-5 minutes in ms
    spawnTimeoutRef.current = setTimeout(() => {
      spawnGoldenBrick();
    }, delay);
  }, [spawnGoldenBrick]);

  useEffect(() => {
    // Initial spawn schedule
    scheduleNextSpawn();
    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [scheduleNextSpawn]);

  useEffect(() => {
    if (isVisible) {
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            // Time's up, hide the brick
            setIsVisible(false);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            scheduleNextSpawn();
            return 0;
          }
          return next;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
    }
  }, [isVisible, scheduleNextSpawn]);

  const handleClick = useCallback(() => {
    if (!isVisible) return;
    const reward = Math.floor(baseIncome * multiplier);
    onCollect(reward);
    setIsVisible(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    scheduleNextSpawn();
  }, [isVisible, baseIncome, multiplier, onCollect, scheduleNextSpawn]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[60] animate-bounce"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={handleClick}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full scale-150 animate-pulse" />
      
      {/* Golden brick container */}
      <div className="relative cursor-pointer select-none active:scale-95 transition-transform duration-100">
        {/* Golden brick shape */}
        <div className="glass-panel px-5 py-4 rounded-xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-yellow-600/30 shadow-[0_0_30px_rgba(250,204,21,0.6),inset_0_0_20px_rgba(250,204,21,0.2)]">
          {/* Brick icon */}
          <div className="text-5xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">
            🧱
          </div>
          
          {/* Multiplier badge */}
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black font-bold text-xs px-2 py-0.5 rounded-full shadow-lg border border-yellow-300">
            {multiplier}x
          </div>
          
          {/* Sparkles */}
          <div className="absolute -top-1 -left-1 text-yellow-300 text-xs animate-ping">✨</div>
          <div className="absolute -bottom-1 -right-1 text-yellow-300 text-xs animate-ping delay-300">✦</div>
        </div>
        
        {/* Countdown timer bar */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-black/50 rounded-full overflow-hidden backdrop-blur-md">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
        
        {/* Timer text */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-yellow-400 font-mono text-[10px] font-bold drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]">
          {timeLeft}s
        </div>
      </div>
    </div>
  );
};

export default GoldenBrick;
