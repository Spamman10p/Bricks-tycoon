import React from 'react';

interface TabBarProps {
    activeTab: string | null;
    onTabChange: (tab: string | null) => void;
}

const TABS = [
  { id: 'upgrades', icon: 'fa-bolt', label: 'Upgrades' },
  { id: 'flex', icon: 'fa-city', label: 'Flex' },
  { id: 'team', icon: 'fa-users', label: 'Team' },
  { id: 'launch', icon: 'fa-rocket', label: 'Launch' },
  { id: 'leaderboard', icon: 'fa-trophy', label: 'Top' },
  { id: 'daily', icon: 'fa-calendar', label: 'Daily' },
  { id: 'achievements', icon: 'fa-star', label: 'Awards' },
  { id: 'tasks', icon: 'fa-check', label: 'Tasks' },
  { id: 'stats', icon: 'fa-chart-bar', label: 'Stats' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40">
      <div className="glass-panel rounded-full p-2 flex justify-between items-center shadow-2xl backdrop-blur-xl bg-black/60 border-t border-white/20">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(isActive ? null : tab.id)}
              className={`
                relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-200
                ${isActive
                  ? 'bg-yellow-500 text-black -translate-y-4 shadow-[0_0_15px_rgba(251,191,36,0.5)] border-2 border-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 active:scale-90'
                }
              `}
            >
              <i className={`fa-solid ${tab.icon} text-xl mb-0.5`} />
              {!isActive && <span className="text-[9px] font-mono tracking-tighter opacity-70">{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
