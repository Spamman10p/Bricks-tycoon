'use client';

import React, { useEffect, useState } from 'react';

interface OfflineEarningsProps {
  amount: number;
  timeAway: number;
  onCollect: () => void;
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    return '24h 0m';
  }
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

const formatCurrency = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
};

export const OfflineEarnings: React.FC<OfflineEarningsProps> = ({
  amount,
  timeAway,
  onCollect,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCollect = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onCollect();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCollect();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          relative w-full max-w-sm glass-panel rounded-2xl border border-yellow-500/30 
          shadow-[0_0_40px_rgba(250,204,21,0.2)] p-6 text-center
          transition-all duration-300 transform
          ${isAnimating ? 'scale-95 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'}
        `}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/50 rounded-br-lg" />

        {/* Icon */}
        <div className="mb-4">
          <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            ⏰
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white pixel-font mb-2 tracking-wide">
          WELCOME BACK!
        </h2>

        {/* Time away */}
        <div className="text-gray-400 text-sm mb-4">
          You were away for{' '}
          <span className="text-yellow-400 font-bold">{formatTime(timeAway)}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-4" />

        {/* Earnings amount */}
        <div className="mb-6">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
            Offline Earnings
          </div>
          <div className="text-4xl font-bold text-green-400 pixel-font drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
            ${formatCurrency(amount)}
          </div>
          <div className="text-yellow-500/70 text-xs mt-1">
            (Capped at 24h)
          </div>
        </div>

        {/* Collect Button */}
        <button
          onClick={handleCollect}
          className="
            w-full py-4 px-6 rounded-xl font-bold text-black
            bg-gradient-to-r from-yellow-400 to-yellow-500
            hover:from-yellow-300 hover:to-yellow-400
            active:scale-[0.98] transition-all duration-150
            shadow-[0_4px_20px_rgba(250,204,21,0.4)]
            text-lg tracking-wider uppercase
          "
        >
          COLLECT
        </button>

        {/* Auto-collect hint */}
        <div className="text-gray-500 text-xs mt-3">
          Tap anywhere to collect
        </div>
      </div>
    </div>
  );
};

export default OfflineEarnings;
