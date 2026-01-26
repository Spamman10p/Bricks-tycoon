'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { BackgroundManager } from './BackgroundManager';
import { StatsHeader } from './StatsHeader';
import { ClickerArea } from './ClickerArea';
import { TabBar } from './TabBar';
import { UpgradeCard } from '../ui/UpgradeCard';
import Launchpad from './Launchpad';
import ConnectButton from '../wallet/ConnectButton';
import { parseReferralParam } from '../../lib/referral';

interface GameState {
  bux: number;
  followers: number;
  upgrades: Record<number, number>;
  items: Record<string, number>;
  staff: Record<string, number>;
  clout: number;
}

interface Upgrade {
  id: number;
  name: string;
  cost: number;
  baseIncome: number;
  icon: string;
}

interface Asset {
  id: string;
  name: string;
  cost: number;
  income: number;
  icon: string;
}

interface Employee {
  id: string;
  name: string;
  cost: number;
  effect: string;
  icon: string;
  type: string;
  val: number;
}

const UPGRADES: Upgrade[] = [
  { id: 1, name: "Spam 'GM' Bot", cost: 15, baseIncome: 1, icon: '🤖' },
  { id: 2, name: 'Paid Blue Check', cost: 100, baseIncome: 5, icon: '✅' },
  { id: 3, name: 'Discord Mod', cost: 500, baseIncome: 25, icon: '🛡️' },
  { id: 4, name: 'Rug Pull Radar', cost: 2000, baseIncome: 100, icon: '📡' },
  { id: 5, name: 'Influencer DM', cost: 10000, baseIncome: 450, icon: '📱' },
];

const ASSETS: Asset[] = [
  { id: 'rolex', name: 'Gold Rolex', cost: 50000, income: 200, icon: '⌚' },
  { id: 'designer', name: 'Designer Drip', cost: 250000, income: 1200, icon: '🧥' },
  { id: 'lambo', name: 'Lambo', cost: 1000000, income: 5000, icon: '🚗' },
  { id: 'yacht', name: 'Yacht', cost: 5000000, income: 25000, icon: '🛥️' },
  { id: 'jet', name: 'Private Jet', cost: 15000000, income: 80000, icon: '✈️' },
  { id: 'penthouse', name: 'Penthouse', cost: 35000000, income: 200000, icon: '🏙️' },
  { id: 'island', name: 'Private Island', cost: 150000000, income: 900000, icon: '🏝️' },
  { id: 'moon', name: 'Moon Base', cost: 500000000, income: 3500000, icon: '🌑' },
];

const EMPLOYEES: Employee[] = [
  { id: 'intern', name: 'Unpaid Intern', cost: 1000, effect: 'Auto-clicks 1x/sec', icon: '👶', type: 'clicker', val: 1 },
  { id: 'mod', name: 'Discord Mod', cost: 5000, effect: 'Auto-clicks 3x/sec', icon: '🛡️', type: 'clicker', val: 3 },
  { id: 'dev', name: 'Rust Dev', cost: 15000, effect: 'Auto-clicks 10x/sec', icon: '🦀', type: 'clicker', val: 10 },
  { id: 'marketer', name: 'Marketing Guru', cost: 35000, effect: 'Auto-clicks 25x/sec', icon: '📈', type: 'clicker', val: 25 },
  { id: 'quant', name: 'Quant Trader', cost: 75000, effect: '+5% Coin Launch Luck', icon: '📊', type: 'luck', val: 0.05 },
  { id: 'solidity', name: 'Solidity Dev', cost: 150000, effect: 'Auto-clicks 100x/sec', icon: '💎', type: 'clicker', val: 100 },
  { id: 'cex', name: 'CEX Manager', cost: 500000, effect: '+10% Coin Launch Luck', icon: '🏦', type: 'luck', val: 0.10 },
];

const DEFAULT_STATE: GameState = {
  bux: 0,
  followers: 1,
  upgrades: {},
  items: {},
  staff: {},
  clout: 0,
};

const format = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
};

export default function Game() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [income, setIncome] = useState(0);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number; val: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bricksTycoon');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }


    // Check Referral
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get('tgWebAppStartParam') || params.get('start');
    const refId = parseReferralParam(startParam);
    if (refId && !localStorage.getItem('bricksReferralUsed')) {
      // Bonus for referral
      setState(p => ({ ...p, bux: p.bux + 1000, followers: p.followers + 50 }));
      localStorage.setItem('bricksReferralUsed', 'true');
      // Ideally notify backend here
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      localStorage.setItem('bricksTycoon', JSON.stringify(state));
    }, 5000);
    return () => clearInterval(interval);
  }, [state, isLoaded]);

  useEffect(() => {
    let ips = 0;
    
    // Upgrades (Passive $/sec)
    UPGRADES.forEach((u) => {
      ips += (state.upgrades[u.id] || 0) * u.baseIncome;
    });

    // Assets (Passive $/sec)
    ASSETS.forEach((a) => {
      if (state.items[a.id]) ips += a.income;
    });

    // Special Upgrade Effect
    if (state.upgrades[2]) {
      ips += Math.floor(state.followers * 0.01);
    }

    // Staff (Auto-clicks/sec -> Converted to $)
    let autoClicksPerSec = 0;
    EMPLOYEES.forEach((e) => {
      if (state.staff[e.id] && e.type === 'clicker') {
        autoClicksPerSec += e.val;
      }
    });

    // Calculate value of a single click (without clout multiplier first)
    const baseClickVal = 1 + Math.floor(state.followers * 0.05);
    const autoClickIncome = autoClicksPerSec * baseClickVal;

    ips += autoClickIncome;

    // Apply Clout Multiplier to total income
    const validIncome = Math.floor(ips * (1 + state.clout * 0.5));
    setIncome(validIncome);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (income > 0) {
        setState((p) => ({ ...p, bux: p.bux + income }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [income]);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const val = Math.floor((1 + Math.floor(state.followers * 0.05)) * (1 + state.clout * 0.5));
    setState((p) => ({ ...p, bux: p.bux + val }));
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    const id = Date.now();
    setClickEffects((p) => [...p, { id, x, y: y - 50, val }]);
    setTimeout(() => setClickEffects((p) => p.filter((e) => e.id !== id)), 800);
  }, [state.followers, state.clout]);

  const buy = (type: string, item: any, cost: number) => {
    if (state.bux >= cost) {
      const key = type === 'upgrade' ? 'upgrades' : type === 'item' ? 'items' : 'staff';
      setState((p) => ({
        ...p,
        bux: p.bux - cost,
        [key]: { ...p[key as keyof GameState] as Record<string | number, number>, [item.id]: ((p[key as keyof GameState] as Record<string | number, number>)[item.id] || 0) + 1 },
        followers: p.followers + (type === 'upgrade' ? (item as Upgrade).baseIncome * 2 : 0),
      }));
    }
  };

  const doPrestige = () => {
    if (state.bux < 10000000) return;
    const earned = Math.floor(state.bux / 10000000);
    setState({ ...DEFAULT_STATE, clout: state.clout + earned });
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex flex-col bg-[#1a1a1a]">
      {/* Layer 0: Background & Dynamic City */}
      <BackgroundManager level={state.clout} />

      {/* Layer 1: Stats Header */}
      <StatsHeader balance={state.bux} profitPerSec={income} />

      {clickEffects.map((e) => (
        <div key={e.id} className="click-text pixel-font" style={{ left: e.x, top: e.y }}>+${e.val}</div>
      ))}

      {/* Layer 2: Main Clicker Area */}
      <div className="flex-1 flex items-center justify-center z-10">
        <ClickerArea onClick={handleClick} />
      </div>

      {/* Layer 3: Tab Bar */}
      <TabBar activeTab={activePanel} onTabChange={setActivePanel} />

      {/* Layer 4: Panels (Drawer) */}
      {activePanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setActivePanel(null)}
          />
          
          {/* Panel */}
          <div className="relative w-full sm:max-w-md h-[70vh] sm:h-[80vh] slide-up z-10">
            <div className="glass-panel h-full rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-yellow-500 shadow-2xl flex flex-col backdrop-blur-xl bg-black/90 mx-auto overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
                <h2 className="text-lg font-bold text-yellow-400 uppercase pixel-font tracking-wider">{activePanel}</h2>
                <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/20">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-thin scrollbar-thumb-yellow-500/20 scrollbar-track-transparent">
                {activePanel === 'upgrades' && UPGRADES.map((u) => {
                  const cost = Math.floor(u.cost * Math.pow(1.15, state.upgrades[u.id] || 0));
                  return (
                    <UpgradeCard
                      key={u.id}
                      title={u.name}
                      level={state.upgrades[u.id] || 0}
                      cost={cost}
                      baseIncome={u.baseIncome}
                      icon={u.icon}
                      canBuy={state.bux >= cost}
                      onBuy={() => buy('upgrade', u, cost)}
                    />
                  );
                })}

                {activePanel === 'flex' && <div className="grid grid-cols-2 gap-3">{ASSETS.map((a) => (
                  <div key={a.id} onClick={() => !state.items[a.id] && buy('item', a, a.cost)} className={`p-3 rounded-xl border text-center min-h-[120px] flex flex-col items-center justify-center transition-all ${state.items[a.id] ? 'border-green-500 bg-green-900/20' : state.bux >= a.cost ? 'glass-panel border-yellow-500 cursor-pointer hover:bg-white/5' : 'bg-black/40 border-gray-800 opacity-50'}`}>
                    <div className="text-4xl mb-2 filter drop-shadow-md">{a.icon}</div>
                    <div className="font-bold text-white text-xs mb-1">{a.name}</div>
                    {state.items[a.id] ? <div className="text-green-400 text-xs font-bold bg-green-900/40 px-2 py-0.5 rounded">OWNED</div> : <div className="text-yellow-400 font-mono text-xs">${format(a.cost)}</div>}
                  </div>
                ))}</div>}

                {activePanel === 'team' && EMPLOYEES.map((e) => (
                  <div key={e.id} onClick={() => !state.staff[e.id] && buy('staff', e, e.cost)} className={`p-3 rounded-xl border mb-2 flex items-center justify-between transition-all ${state.staff[e.id] ? 'border-blue-500 bg-blue-900/20' : state.bux >= e.cost ? 'glass-panel border-gray-600 cursor-pointer hover:border-blue-400' : 'bg-black/40 border-gray-800 opacity-50'}`}>
                    <div className="flex items-center gap-3"><div className="text-2xl">{e.icon}</div><div><div className="font-bold text-sm text-gray-200">{e.name}</div><div className="text-xs text-gray-500">{e.effect}</div></div></div>
                    <div className={`font-mono text-xs font-bold ${state.staff[e.id] ? 'text-blue-400' : 'text-yellow-500'}`}>{state.staff[e.id] ? 'HIRED' : '$' + format(e.cost)}</div>
                  </div>
                ))}

                {activePanel === 'launch' && <Launchpad
                  followers={state.followers}
                  bux={state.bux}
                  luckBonus={state.staff['quant'] ? 0.05 : 0}
                  onFinishLaunch={(profit, isRug) => {
                    if (profit > 0) {
                      setState(p => ({ ...p, bux: p.bux + profit, followers: Math.floor(p.followers * (isRug ? 0.9 : 1.1)) }));
                    }
                  }}
                />}

                {activePanel === 'profile' && (
                  <div className="text-center space-y-4">
                    <div className="glass-panel p-6 rounded-xl border border-purple-500/30 bg-purple-900/10">
                      <div className="text-5xl mb-3">👑</div><h3 className="text-2xl font-bold text-white pixel-font mb-1">LVL {state.clout}</h3><p className="text-purple-300 text-xs uppercase mb-4">Clout Multiplier</p>
                      <div className="bg-black/50 p-2 rounded text-green-400 font-mono text-sm border border-white/10">x{1 + state.clout * 0.5} Earnings</div>
                    </div>
                    {state.bux >= 10000000 ? (
                      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/50"><h3 className="text-red-400 font-bold mb-2">EXIT SCAM</h3><button onClick={doPrestige} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded w-full shadow-lg shadow-red-900/50">RUG THE WORLD (+{Math.floor(state.bux / 10000000)})</button></div>
                    ) : <div className="p-4 rounded border border-gray-800 text-gray-600 text-xs">Need $10M to Prestige</div>}
                    <button onClick={() => { if (confirm('Reset?')) { localStorage.removeItem('bricksTycoon'); window.location.reload(); } }} className="text-xs text-gray-600 hover:text-red-500 underline">Delete Save</button>
                    <div className="pt-4 border-t border-gray-800 mt-4">
                      <ConnectButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}