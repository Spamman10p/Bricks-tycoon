import React, { useState } from 'react';
import Image from 'next/image';

interface ClickerAreaProps {
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ClickerArea: React.FC<ClickerAreaProps> = ({ onClick }) => {
  const [isHolding, setIsHolding] = useState(false);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    onClick(e);
    setIsHolding(true);
    setTimeout(() => setIsHolding(false), 150);
  };

  return (
    <div 
      className="relative cursor-pointer select-none transition-transform duration-100" 
      onClick={handleClick} 
      onTouchStart={handleClick}>
      <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-75 animate-pulse" />
      <div className="relative w-[180px] h-[180px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <Image
          src={isHolding ? "/images/alon-holding.png" : "/images/alon.png"}
          alt="Alon"
          fill
          priority
          className="object-cover transition-opacity duration-100"
        />
      </div>
      <div className="mt-4 flex justify-center">
        <span className="pixel-font text-yellow-400 text-sm animate-bounce">TAP TO EARN</span>
      </div>
    </div>
  );
};
