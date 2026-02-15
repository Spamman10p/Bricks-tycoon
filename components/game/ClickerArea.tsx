import React from 'react';
import Image from 'next/image';

interface ClickerAreaProps {
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ClickerArea: React.FC<ClickerAreaProps> = ({ onClick }) => {
  return (
    <div 
      className="relative cursor-pointer select-none active:scale-95 transition-transform duration-100 ease-out"
      onClick={onClick}
      onTouchStart={onClick}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-75 animate-pulse" />
      
      {/* Character - Smaller and positioned higher */}
      <div className="relative w-[200px] h-[200px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <svg width="200" height="200" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
          <defs>
            <mask id="character-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <image href="/images/character_mask.png" width="1024" height="1024" />
            </mask>
          </defs>
          <image href="/images/character_source.jpg" width="1024" height="1024" mask="url(#character-mask)" />
        </svg>
      </div>
      
      {/* Tap Hint - moved higher */}
      <div className="mt-4 flex justify-center">
        <span className="pixel-font text-yellow-400 text-sm animate-bounce shadow-black drop-shadow-md">
          TAP TO EARN
        </span>
      </div>
    </div>
  );
};
