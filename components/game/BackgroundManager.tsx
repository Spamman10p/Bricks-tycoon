'use client';

import React from 'react';
import Image from 'next/image';

interface BackgroundManagerProps {
  bux?: number;
  level?: number;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ 
  bux = 0,
  level = 1 
}) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Street Fighter Style Background */}
      <div className="absolute inset-0">
        <Image 
          src="/images/street-bg.jpg" 
          alt="Street Background"
          fill 
          priority
          className="object-cover object-top"
          style={{ 
            objectPosition: 'center 30%',
            transform: 'scale(1.1)'
          }}
        />
        {/* Vignette for depth */}
        <div className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        {/* Bottom gradient for UI readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>
    </div>
  );
};

export default BackgroundManager;