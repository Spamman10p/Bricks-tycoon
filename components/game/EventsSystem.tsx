'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  name: string;
  description: string;
  bonus: number;
  icon: string;
  endsAt: number; // timestamp
}

const ACTIVE_EVENTS: Event[] = [
  {
    id: 'weekend',
    name: 'Weekend Boost',
    description: '2x BUX earned all weekend!',
    bonus: 2,
    icon: '🎉',
    endsAt: new Date().getTime() + 2 * 24 * 60 * 60 * 1000, // 2 days
  },
  {
    id: 'lunar',
    name: 'Lunar New Year',
    description: 'Lucky red envelope +50% income',
    bonus: 1.5,
    icon: '🧧',
    endsAt: new Date().getTime() + 5 * 24 * 60 * 60 * 1000, // 5 days
  },
];

interface EventsSystemProps {
  onBonusApply: (bonus: number) => void;
}

export default function EventsSystem({ onBonusApply }: EventsSystemProps) {
  const [events, setEvents] = useState<Event[]>(ACTIVE_EVENTS);
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  // Update countdown timers
  useEffect(() => {
    const updateTimers = () => {
      const now = new Date().getTime();
      const newTimeLeft: Record<string, string> = {};
      
      events.forEach(event => {
        const diff = event.endsAt - now;
        if (diff <= 0) {
          newTimeLeft[event.id] = 'ENDED';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimeLeft[event.id] = days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`;
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [events]);

  const activeEvents = events.filter(e => timeLeft[e.id] !== 'ENDED');

  if (activeEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-red-900/50 p-3 rounded-lg border border-purple-500 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🎊</span>
        <span className="text-white font-bold text-sm">LIVE EVENTS</span>
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
          {activeEvents.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {activeEvents.map(event => (
          <div key={event.id} className="bg-black/30 p-2 rounded flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{event.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{event.name}</div>
                <div className="text-gray-400 text-xs">{event.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-sm">+{Math.round((event.bonus - 1) * 100)}%</div>
              <div className="text-red-300 text-xs">{timeLeft[event.id]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
