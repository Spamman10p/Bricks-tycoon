'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const steps = [
      { msg: 'Loading assets...', dur: 300 },
      { msg: 'Building city...', dur: 400 },
      { msg: 'Spawning bricks...', dur: 300 },
      { msg: 'Starting engines...', dur: 200 },
      { msg: 'Ready!', dur: 100 },
    ];

    let total = 0;
    steps.forEach((step, i) => {
      setTimeout(() => {
        setStatus(step.msg);
        setProgress(((i + 1) / steps.length) * 100);
      }, total);
      total += step.dur;
    });
  }, []);

  return (
    <div className="w-full h-screen bg-[#1a1a1a] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 pixel-font">BRICKS</h1>
        
        {/* Progress Bar */}
        <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 mb-4">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-gray-400 text-sm">{status}</p>
      </div>
    </div>
  );
}
