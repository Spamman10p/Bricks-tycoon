import React from 'react';

interface TabBarProps {
    activeTab: string | null;
    onTabChange: (tab: string | null) => void;
}

const TABS = [
  { id: 'upgrades', icon: 'fa-bolt', label: 'Build' },
  { id: 'flex', icon: 'fa-city', label: 'City' },
  { id: 'team', icon: 'fa-users', label: 'Crew' },
  { id: 'launch', icon: 'fa-rocket', label: 'Launch' },
  { id: 'daily', icon: 'fa-calendar', label: 'Daily' },
  { id: 'achievements', icon: 'fa-trophy', label: 'Awards' },
  { id: 'tasks', icon: 'fa-check', label: 'Tasks' },
  { id: 'stats', icon: 'fa-chart-bar', label: 'Stats' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];
