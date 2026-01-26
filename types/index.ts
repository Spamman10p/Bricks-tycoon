// Game State Types
export interface GameState {
  bux: number;
  followers: number;
  upgrades: Record<number, number>;
  items: Record<string, number>;
  staff: Record<string, number>;
  clout: number;
  isCoinHolder?: boolean;
  achievements?: Record<string, boolean>;
  hasSeenTutorial?: boolean;
}

export interface Upgrade {
  id: number;
  name: string;
  cost: number;
  baseIncome: number;
  icon: string;
}

export interface Asset {
  id: string;
  name: string;
  cost: number;
  income: number;
  icon: string;
  x?: number;
  y?: number;
  scale?: number;
  type?: string;
}

export interface Employee {
  id: string;
  name: string;
  cost: number;
  effect: string;
  icon: string;
  type: string;
  val: number;
}

// Telegram Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
  };
  CloudStorage: {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    getKeys: () => Promise<string[]>;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
