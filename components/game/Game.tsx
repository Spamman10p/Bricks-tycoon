"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BackgroundManager } from "./BackgroundManager";
import { StatsHeader } from "./StatsHeader";
import { ClickerArea } from "./ClickerArea";
import { TabBar } from "./TabBar";
import { UpgradeCard } from "../ui/UpgradeCard";
import Launchpad from "./Launchpad";
import ConnectButton from "../wallet/ConnectButton";
import { parseReferralParam } from "../../lib/referral";
import GoldenBrick from "./GoldenBrick";
import { DailyRewards } from "./DailyRewards";
import OfflineEarnings from "./OfflineEarnings";
import { Achievements, ACHIEVEMENTS, GameStats } from "./Achievements";
import { Stats } from "./Stats";
import { Tasks } from "./Tasks";
import { SolanaWallet } from "../wallet/SolanaWallet";
import Leaderboard from "./Leaderboard";
import EventsSystem from "./EventsSystem";
import SoundManager from "./SoundManager";

interface GameState {
  bux: number;
  followers: number;
  upgrades: Record<number, number>;
  items: Record<string, number>;
  staff: Record<string, number>;
  clout: number;
  // Username for leaderboard
  username: string;
  // Tracking fields
  totalClicks: number;
  totalEarned: number;
  highestBalance: number;
  totalSpent: number;
  totalPrestiges: number;
  // Time tracking - actual seconds played (not elapsed time)
  totalTimePlayed: number;
  // Daily rewards
  lastDailyClaim: string | null;
  dailyStreak: number;
  // Achievements
  achievementsUnlocked: string[];
  achievementsClaimed: string[];
  // Offline tracking
  lastOnline: string;
  taskLastReset: string;
  startDate: string;
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
  clickValue: number;
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
  { id: 1, name: "Spam 'GM' Bot", cost: 15, baseIncome: 1, icon: "🤖" },
  { id: 2, name: "Paid Blue Check", cost: 100, baseIncome: 5, icon: "✅" },
  { id: 3, name: "Discord Mod", cost: 500, baseIncome: 25, icon: "🛡️" },
  { id: 4, name: "Rug Pull Radar", cost: 2000, baseIncome: 100, icon: "📡" },
  { id: 5, name: "Influencer DM", cost: 10000, baseIncome: 450, icon: "📱" },
];

// Cost scaling - 50% per level (Task 1)
// Income scaling - 20% per level (Task 1)
// Max level - 50 (Task 2)
const COST_SCALING_RATE = 1.50;
const INCOME_SCALING_RATE = 1.20;
const MAX_UPGRADE_LEVEL = 50;

const getUpgradeCost = (baseCost: number, ownedLevel: number): number => {
  if (ownedLevel === 0) return baseCost;
  return Math.floor(baseCost * Math.pow(COST_SCALING_RATE, ownedLevel));
};

const getUpgradeIncome = (baseIncome: number, ownedLevel: number): number => {
  if (ownedLevel === 0) return 0;
  return Math.floor(baseIncome * Math.pow(INCOME_SCALING_RATE, ownedLevel - 1));
};

const ASSETS: Asset[] = [
  { id: "rolex", name: "Gold Rolex", cost: 50000, income: 0, clickValue: 99, icon: "⌚" },
  { id: "designer", name: "Designer Drip", cost: 250000, income: 0, clickValue: 400, icon: "🧥" },
  { id: "lambo", name: "Lambo", cost: 1000000, income: 0, clickValue: 1500, icon: "🚗" },
  { id: "yacht", name: "Yacht", cost: 5000000, income: 0, clickValue: 8000, icon: "🛥️" },
  { id: "jet", name: "Private Jet", cost: 20000000, income: 0, clickValue: 20000, icon: "✈️" },
  { id: "penthouse", name: "Penthouse", cost: 35000000, income: 0, clickValue: 22000, icon: "🏙️" },
  { id: "island", name: "Private Island", cost: 150000000, income: 0, clickValue: 50000, icon: "🏝️" },
  { id: "moon", name: "Moon Base", cost: 500000000, income: 0, clickValue: 400000, icon: "🌑" },
];

const EMPLOYEES: Employee[] = [
  {
    id: "intern",
    name: "Unpaid Intern",
    cost: 1000,
    effect: "Auto-clicks 1x/sec",
    icon: "👶",
    type: "clicker",
    val: 1,
  },
  {
    id: "mod",
    name: "Discord Mod",
    cost: 5000,
    effect: "Auto-clicks 3x/sec",
    icon: "🛡️",
    type: "clicker",
    val: 3,
  },
  {
    id: "dev",
    name: "Rust Dev",
    cost: 15000,
    effect: "Auto-clicks 10x/sec",
    icon: "🦀",
    type: "clicker",
    val: 10,
  },
  {
    id: "marketer",
    name: "Marketing Guru",
    cost: 35000,
    effect: "Auto-clicks 25x/sec",
    icon: "📈",
    type: "clicker",
    val: 25,
  },
  {
    id: "quant",
    name: "Quant Trader",
    cost: 75000,
    effect: "+5% Coin Launch Luck",
    icon: "📊",
    type: "luck",
    val: 0.05,
  },
  {
    id: "solidity",
    name: "Solidity Dev",
    cost: 150000,
    effect: "Auto-clicks 100x/sec",
    icon: "💎",
    type: "clicker",
    val: 100,
  },
  {
    id: "cex",
    name: "CEX Manager",
    cost: 500000,
    effect: "+10% Coin Launch Luck",
    icon: "🏦",
    type: "luck",
    val: 0.1,
  },
];

const DEFAULT_STATE: GameState = {
  bux: 0,
  followers: 1,
  upgrades: {},
  items: {},
  staff: {},
  clout: 0,
  username: "",
  // Tracking
  totalClicks: 0,
  totalEarned: 0,
  highestBalance: 0,
  totalSpent: 0,
  totalPrestiges: 0,
  totalTimePlayed: 0, // actual seconds played (accurate)
  // Daily rewards
  lastDailyClaim: null,
  dailyStreak: 0,
  // Achievements
  achievementsUnlocked: [],
  achievementsClaimed: [],
  // Offline tracking
  lastOnline: new Date().toISOString(),
  taskLastReset: new Date().toISOString(),
  startDate: new Date().toISOString(),
};

const format = (n: number): string => {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "Qa";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return n.toLocaleString();
};

export default function Game() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [income, setIncome] = useState(0);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [clickEffects, setClickEffects] = useState<
    { id: number; x: number; y: number; val: number }[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Task 5: Prestige modal state
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const saved = localStorage.getItem("bricksTycoon");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to load save:", e);
      }
    }

    // Check Referral
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get("tgWebAppStartParam") || params.get("start");
    const refId = parseReferralParam(startParam);
    if (refId && !localStorage.getItem("bricksReferralUsed")) {
      // Bonus for referral
      setState((p) => ({
        ...p,
        bux: p.bux + 1000,
        followers: p.followers + 50,
      }));
      localStorage.setItem("bricksReferralUsed", "true");
      // Ideally notify backend here
    }

    setIsLoaded(true);
  }, []);

  // Sync to Supabase
  const syncToSupabase = useCallback(async () => {
    const currentState = stateRef.current;
    if (!currentState.bux && currentState.followers === 1) return; // Don't save empty state immediately

    // Get Telegram User ID (mock or real)
    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegram_id = tgUser?.id || 12345; // Fallback for dev/browser without TG
    const username = tgUser?.username || "Browser User";

    // Get raw initData for validation
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData;

    // SAVE LOCALLY (Fix for "Auto Save Failed")
    localStorage.setItem("bricksTycoon", JSON.stringify(currentState));

    try {
      await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_id,
          username,
          bux: currentState.bux,
          followers: currentState.followers,
          clout: currentState.clout,
          game_state: currentState,
          initData, // Send for validation
        }),
      });
      // console.log('Saved to Supabase');
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(syncToSupabase, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, [syncToSupabase, isLoaded]);
  // Wallet rewards listener
  useEffect(() => {
    const handleWalletRewards = (e: any) => {
      const { bux, clout } = e.detail;
      setState((p) => ({
        ...p,
        bux: p.bux + bux,
        clout: p.clout + clout,
      }));
    };
    window.addEventListener("walletRewards", handleWalletRewards);
    return () =>
      window.removeEventListener("walletRewards", handleWalletRewards);
  }, []);

  useEffect(() => {
    let ips = 0;

    // Upgrades (Passive $/sec) - Uses 30% scaling
    UPGRADES.forEach((u) => {
      const level = state.upgrades[u.id] || 0;
      ips += getUpgradeIncome(u.baseIncome, level);
    });

    // Assets (CITY/FLEX items) - REMOVED: Now boost click value instead

    // Special Upgrade Effect
    if (state.upgrades[2]) {
      ips += Math.floor(state.followers * 0.01);
    }

    // Staff (Auto-clicks/sec -> Converted to $)
    let autoClicksPerSec = 0;
    EMPLOYEES.forEach((e) => {
      if (state.staff[e.id] && e.type === "clicker") {
        autoClicksPerSec += e.val;
      }
    });

    // Calculate value of a single click (without clout multiplier first)
    const baseClickVal = 1 + Math.floor(state.followers * 0.005);
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
  
  // Task 4: Accurate time tracking - increments every second while game is active
  useEffect(() => {
    const timer = setInterval(() => {
      setState((p) => ({ ...p, totalTimePlayed: (p.totalTimePlayed || 0) + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Force save on page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentState = { ...state, lastOnline: new Date().toISOString() };
      localStorage.setItem("bricksTycoon", JSON.stringify(currentState));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      // Calculate click value: base from followers + flex items owned
      const baseClick = 1 + Math.floor(state.followers * 0.005);
      // Sum up clickValue from all owned flex items
      const flexClickValue = ASSETS.reduce((total, asset) => {
        return total + (state.items[asset.id] ? asset.clickValue : 0);
      }, 0);
      // Total before clout multiplier
      const preCloutVal = baseClick + flexClickValue;
      // Apply clout multiplier
      const val = Math.floor(preCloutVal * (1 + state.clout * 0.5));
      setState((p) => {
        const newBux = p.bux + val;
        return {
          ...p,
          bux: newBux,
          totalClicks: p.totalClicks + 1,
          totalEarned: p.totalEarned + val,
          highestBalance: Math.max(p.highestBalance, newBux),
        };
      });
      if ((window as any).playClickSound) (window as any).playClickSound();
      let x: number, y: number;
      if ("touches" in e) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      const id = Date.now();
      setClickEffects((p) => [...p, { id, x, y: y - 50, val }]);
      setTimeout(
        () => setClickEffects((p) => p.filter((e) => e.id !== id)),
        800,
      );
    },
    [state.followers, state.clout],
  );

  const [showFlex, setShowFlex] = useState<{
    name: string;
    type: string;
  } | null>(null);

  // Clear flex toast after 5s
  useEffect(() => {
    if (showFlex) {
      const timer = setTimeout(() => setShowFlex(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showFlex]);

  const handleFlex = (platform: "twitter" | "telegram") => {
    if (!showFlex) return;
    const text = `Just bought ${showFlex.name} in @BricksAITycoonBot! I'm rich. 🧱💰 #BricksTycoon`;
    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else {
      // @ts-ignore
      window.Telegram?.WebApp?.openTelegramLink(
        `https://t.me/share/url?url=https://t.me/BricksAITycoonBot&text=${encodeURIComponent(text)}`,
      );
    }
    setShowFlex(null);
  };

  const buy = (type: string, item: any, cost: number) => {
    // Flex items must be purchased in ascending price order
    if (type === "item") {
      const assetIndex = ASSETS.findIndex(a => a.id === item.id);
      if (assetIndex > 0) {
        const prevAsset = ASSETS[assetIndex - 1];
        if (!state.items[prevAsset.id]) {
          // Previous item not owned - can't buy this one
          return;
        }
      }
    }
    
    if (state.bux >= cost) {
      if ((window as any).playUpgradeSound) (window as any).playUpgradeSound();
      const key =
        type === "upgrade" ? "upgrades" : type === "item" ? "items" : "staff";
      setState((p) => ({
        ...p,
        bux: p.bux - cost,
        [key]: {
          ...(p[key as keyof GameState] as Record<string | number, number>),
          [item.id]:
            ((p[key as keyof GameState] as Record<string | number, number>)[
              item.id
            ] || 0) + 1,
        },
        followers:
          p.followers +
          (type === "upgrade" ? (item as Upgrade).baseIncome * 2 : 0),
      }));

      // Trigger Flex Mode
      setShowFlex({ name: item.name, type });
    }
  };

  const doPrestige = async () => {
    if (state.bux < 10000000) return;
    const earned = Math.floor(state.bux / 10000000);
    if ((window as any).playPrestigeSound) (window as any).playPrestigeSound();
    
    // Save score to leaderboard before reset
    if (state.username) {
      try {
        // Check if exists first
        const checkRes = await fetch(
          `https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard?player_name=eq.${encodeURIComponent(state.username)}&limit=1`,
          {
            headers: {
              'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
              'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O'
            }
          }
        );
        const existing = await checkRes.json();
        
        if (existing && existing.length > 0) {
          // Update if higher score
          if (state.bux > existing[0].bux) {
            await fetch(
              `https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard?player_name=eq.${encodeURIComponent(state.username)}`,
              {
                method: 'PATCH',
                headers: {
                  'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                  'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bux: state.bux, clout: state.clout + earned })
              }
            );
          }
        } else {
          await fetch('https://qwxuamrbztltmdvtmmeb.supabase.co/rest/v1/leaderboard', {
            method: 'POST',
            headers: {
              'apikey': 'sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
              'Authorization': 'Bearer sb_publishable_Hhh-7A3Ady1SdezkPoL3EA_7WwRhX4O',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              player_name: state.username,
              bux: state.bux,
              clout: state.clout + earned
            })
          });
        }
      } catch (e) { console.error('Failed to save score:', e); }
    }
    
    setState({ ...DEFAULT_STATE, username: state.username, clout: state.clout + earned });
  };

  return (
    <div className="w-full h-screen relative overflow-hidden flex flex-col bg-[#1a1a1a]">
      {/* Username Modal - Required on first play */}
      {!state.username && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl border-2 border-yellow-500 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">👾 CHOOSE USERNAME</h2>
            <p className="text-gray-400 text-center mb-6">This will appear on the leaderboard</p>
            <input
              type="text"
              id="usernameInput"
              placeholder="Enter username..."
              maxLength={15}
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-yellow-500/50 text-white text-center text-lg focus:border-yellow-400 outline-none mb-4"
              onKeyDown={(e) => e.key === 'Enter' && (document.getElementById('submitUsername') as HTMLButtonElement)?.click()}
            />
            <button
              id="submitUsername"
              onClick={() => {
                const input = document.getElementById('usernameInput') as HTMLInputElement;
                const name = input.value.trim();
                if (name.length >= 3) {
                  setState(p => ({ ...p, username: name }));
                }
              }}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
            >
              START GAME
            </button>
            <p className="text-gray-500 text-xs text-center mt-4">Min 3 characters</p>
          </div>
        </div>
      )}

      <SoundManager />
      {/* Layer 0: Background & Dynamic City */}
      <BackgroundManager bux={state.bux} level={state.clout} />
      <GoldenBrick baseIncome={income} onCollect={() => {}} />
      <EventsSystem onBonusApply={(bonus) => {}} />

      {/* Layer 1: Stats Header */}
      <StatsHeader balance={state.bux} profitPerSec={income} />

      {/* FLEX TOAST */}
      {showFlex && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce cursor-pointer">
          <div className="glass-panel px-6 py-3 rounded-full border border-yellow-400 bg-black/80 flex items-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            <span className="text-yellow-400 text-xs font-bold whitespace-nowrap">
              BOUGHT {showFlex.name.toUpperCase()}!
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFlex("twitter")}
                className="text-lg hover:scale-110 transition-transform"
              >
                🐦
              </button>
              <button
                onClick={() => handleFlex("telegram")}
                className="text-lg hover:scale-110 transition-transform"
              >
                ✈️
              </button>
            </div>
          </div>
        </div>
      )}

      {clickEffects.map((e) => (
        <div
          key={e.id}
          className="click-text pixel-font"
          style={{ left: e.x, top: e.y }}
        >
          +${e.val}
        </div>
      ))}

      {/* Layer 2: Main Clicker Area - Positioned higher up */}
      <div className="absolute top-[20%] left-0 right-0 flex justify-center z-10">
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
                <h2 className="text-lg font-bold text-yellow-400 uppercase pixel-font tracking-wider">
                  {activePanel}
                </h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="w-8 h-8 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-thin scrollbar-thumb-yellow-500/20 scrollbar-track-transparent">
                {activePanel === "upgrades" &&
                  UPGRADES.map((u) => {
                    const currentLevel = state.upgrades[u.id] || 0;
                    const cost = getUpgradeCost(u.cost, currentLevel);
                    return (
                      <UpgradeCard
                        key={u.id}
                        title={u.name}
                        level={state.upgrades[u.id] || 0}
                        cost={cost}
                        baseIncome={getUpgradeIncome(u.baseIncome, currentLevel + 1)}
                        icon={u.icon}
                        canBuy={state.bux >= cost && currentLevel < MAX_UPGRADE_LEVEL}
                        onBuy={() => buy("upgrade", u, cost)}
                      />
                    );
                  })}

                {activePanel === "flex" && (
                  <div className="grid grid-cols-2 gap-3">
                    {ASSETS.map((a) => (
                      <div
                        key={a.id}
                        onClick={() =>
                          !state.items[a.id] && buy("item", a, a.cost)
                        }
                        className={`p-3 rounded-xl border text-center min-h-[120px] flex flex-col items-center justify-center transition-all ${state.items[a.id] ? "border-green-500 bg-green-900/20" : state.bux >= a.cost ? "glass-panel border-yellow-500 cursor-pointer hover:bg-white/5" : "bg-black/40 border-gray-800 opacity-50"}`}
                      >
                        <div className="text-4xl mb-2 filter drop-shadow-md">
                          {a.icon}
                        </div>
                        <div className="font-bold text-white text-xs mb-1">
                          {a.name}
                        </div>
                        {state.items[a.id] ? (
                          <div className="text-green-400 text-xs font-bold bg-green-900/40 px-2 py-0.5 rounded">
                            OWNED
                          </div>
                        ) : (
                          <div className="text-yellow-400 font-mono text-xs">
                            ${format(a.cost)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activePanel === "team" &&
                  EMPLOYEES.map((e) => (
                    <div
                      key={e.id}
                      onClick={() =>
                        !state.staff[e.id] && buy("staff", e, e.cost)
                      }
                      className={`p-3 rounded-xl border mb-2 flex items-center justify-between transition-all ${state.staff[e.id] ? "border-blue-500 bg-blue-900/20" : state.bux >= e.cost ? "glass-panel border-gray-600 cursor-pointer hover:border-blue-400" : "bg-black/40 border-gray-800 opacity-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{e.icon}</div>
                        <div>
                          <div className="font-bold text-sm text-gray-200">
                            {e.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {e.effect}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-mono text-xs font-bold ${state.staff[e.id] ? "text-blue-400" : "text-yellow-500"}`}
                      >
                        {state.staff[e.id] ? "HIRED" : "$" + format(e.cost)}
                      </div>
                    </div>
                  ))}

                {activePanel === "launch" && (
                  <Launchpad
                    followers={state.followers}
                    bux={state.bux}
                    luckBonus={state.staff["quant"] ? 0.05 : 0}
                    onPay={(cost) =>
                      setState((p) => ({ ...p, bux: p.bux - cost }))
                    }
                    onFinishLaunch={(profit, isRug) => {
                      if (profit > 0) {
                        setState((p) => ({
                          ...p,
                          bux: p.bux + profit,
                          followers: Math.floor(
                            p.followers * (isRug ? 0.9 : 1.1),
                          ),
                        }));
                      }
                    }}
                  />
                )}

                {activePanel === "leaderboard" && (
                  <Leaderboard
                    currentBux={state.bux}
                    currentClout={state.clout}
                    playerName={state.username}
                  />
                )}

                {activePanel === "daily" && (
                  <DailyRewards
                    lastClaim={state.lastDailyClaim}
                    streak={state.dailyStreak}
                    onClaim={(day) => {
                      const reward =
                        [100, 250, 500, 1000, 2500, 5000, 10000][day - 1] ||
                        100;
                      setState((p) => ({
                        ...p,
                        bux: p.bux + reward,
                        lastDailyClaim: new Date().toISOString(),
                        dailyStreak: Math.min(day, 7),
                      }));
                    }}
                  />
                )}
                {activePanel === "stats" && (
                  <Stats
                    stats={{
                      totalClicks: state.totalClicks,
                      totalEarned: state.totalEarned,
                      timePlayed: state.totalTimePlayed || 0,
                      bestCombo: 0,
                      totalPrestiges: state.totalPrestiges,
                      highestBalance: state.highestBalance,
                      totalSpent: state.totalSpent,
                      startDate: state.startDate,
                    }}
                  />
                )}
                {activePanel === "achievements" && (
                  <Achievements
                    stats={{
                      clicks: state.totalClicks,
                      upgrades: Object.values(state.upgrades).reduce(
                        (a, b) => a + (b || 0),
                        0,
                      ),
                      prestiges: 0,
                      totalEarned: state.totalEarned,
                      maxUpgrades: UPGRADES.length,
                    }}
                    unlocked={state.achievementsUnlocked}
                    onClaim={(id, reward) =>
                      setState((p) => ({
                        ...p,
                        bux: p.bux + reward,
                        achievementsUnlocked: [...p.achievementsUnlocked, id],
                      }))
                    }
                  />
                )}
                {activePanel === "tasks" && (
                  <Tasks tasks={[]} onClaim={(id) => {}} />
                )}
                {activePanel === "profile" && (
                  <div className="text-center space-y-4">
                    <div className="glass-panel p-6 rounded-xl border border-purple-500/30 bg-purple-900/10">
                      <div className="text-5xl mb-3">👑</div>
                      <h3 className="text-2xl font-bold text-white pixel-font mb-1">
                        LVL {state.clout}
                      </h3>
                      <p className="text-purple-300 text-xs uppercase mb-4">
                        Clout Multiplier
                      </p>
                      <div className="bg-black/50 p-2 rounded text-green-400 font-mono text-sm border border-white/10">
                        x{1 + state.clout * 0.5} Earnings
                      </div>
                    </div>
                    {/* REFERRAL HUB */}
                    {/* SOLANA WALLET */} <SolanaWallet />
                    <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-blue-900/10">
                      <h3 className="text-blue-300 font-bold mb-2 text-sm uppercase">
                        Invite & Earn
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // @ts-ignore
                            const tgId =
                              window.Telegram?.WebApp?.initDataUnsafe?.user
                                ?.id || 12345;
                            const link = `https://t.me/BricksAITycoonBot?start=ref_${tgId}`;
                            // @ts-ignore
                            window.Telegram?.WebApp?.openTelegramLink(
                              `https://t.me/share/url?url=${link}&text=Stop being poor. Join me in Bricks Tycoon 🧱`,
                            );
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold text-sm"
                        >
                          INVITE FRIENDS
                        </button>
                        <button
                          onClick={() => {
                            // @ts-ignore
                            const tgId =
                              window.Telegram?.WebApp?.initDataUnsafe?.user
                                ?.id || 12345;
                            const link = `https://t.me/BricksAITycoonBot?start=ref_${tgId}`;
                            navigator.clipboard.writeText(link);
                            alert("Link Copied!");
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    {state.bux >= 10000000 ? (
                      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/50">
                        <h3 className="text-red-400 font-bold mb-2">
                          EXIT SCAM
                        </h3>
                        <button
                          onClick={() => setShowPrestigeModal(true)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded w-full shadow-lg shadow-red-900/50"
                        >
                          RUG THE WORLD (+{Math.floor(state.bux / 10000000)})
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded border border-gray-800 text-gray-600 text-xs">
                        Need $10M to Prestige
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Reset?")) {
                          localStorage.removeItem("bricksTycoon");
                          window.location.reload();
                        }
                      }}
                      className="text-xs text-gray-600 hover:text-red-500 underline"
                    >
                      Delete Save
                    </button>
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
    

      {/* Task 5: Prestige Confirmation Modal */}
      {showPrestigeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPrestigeModal(false)} />
          <div className="relative bg-gray-900 border-2 border-red-500 rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl shadow-red-900/50">
            <div className="text-5xl mb-4">🚨</div>
            <h3 className="text-2xl font-bold text-red-400 mb-2 pixel-font">CONFIRM EXIT SCAM</h3>
            <p className="text-gray-300 text-sm mb-4">
              You are about to execute an Exit Scam and take <span className="text-green-400 font-bold">+{Math.floor(state.bux / 10000000)} Clout</span>
            </p>
            <div className="bg-black/50 p-3 rounded mb-4 text-left text-xs space-y-1">
              <p className="text-green-400">✅ Keep: Clout Multiplier (x{1 + (state.clout + Math.floor(state.bux / 10000000)) * 0.5} earnings)</p>
              <p className="text-red-400">❌ Reset: All BUX, Upgrades, Items, Staff</p>
              <p className="text-yellow-400">⚠️ First prestige unlocks: Special features</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPrestigeModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  doPrestige();
                  setShowPrestigeModal(false);
                }}
                className="bg-red-600 hover:bg-red-500 text-white py-3 rounded font-bold animate-pulse"
              >
                RUG IT! 💰
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
