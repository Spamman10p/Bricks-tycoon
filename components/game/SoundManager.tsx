'use client';

import { useEffect, useRef } from 'react';

interface SoundManagerProps {
  enabled?: boolean;
}

export default function SoundManager({ enabled = true }: SoundManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  // Expose sound functions globally
  useEffect(() => {
    (window as any).playClickSound = () => playTone(800, 0.1, 'sine');
    (window as any).playUpgradeSound = () => {
      playTone(523, 0.1, 'sine');
      setTimeout(() => playTone(659, 0.1, 'sine'), 50);
      setTimeout(() => playTone(784, 0.15, 'sine'), 100);
    };
    (window as any).playPrestigeSound = () => {
      playTone(262, 0.2, 'triangle');
      setTimeout(() => playTone(330, 0.2, 'triangle'), 100);
      setTimeout(() => playTone(392, 0.3, 'triangle'), 200);
      setTimeout(() => playTone(523, 0.4, 'triangle'), 300);
    };
    (window as any).playCoinSound = () => playTone(1200, 0.15, 'square');

    return () => {
      delete (window as any).playClickSound;
      delete (window as any).playUpgradeSound;
      delete (window as any).playPrestigeSound;
      delete (window as any).playCoinSound;
    };
  }, [enabled]);

  return null;
}
