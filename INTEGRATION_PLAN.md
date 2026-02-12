# Game.tsx Integration Plan
*2026-02-12 | Components: 6 | ETA: 30 min*

---

## Changes Required

### 1. Update GameState Interface
```typescript
// Add to existing GameState interface:
interface GameState {
  // ... existing fields ...
  
  // Daily Rewards
  lastDailyClaim: string | null;
  dailyStreak: number;
  
  // Achievements: tracking
  totalClicks: number;
  totalEarned: number;
  achievementsUnlocked: string[];
  achievementsClaimed: string[];
  
  // Offline tracking
  lastOnline: string;
  
  // Tasks
  tasksCompleted: string[];
  taskLastReset: string;
}
```

### 2. Import New Components
```typescript
import { GoldenBrick } from './GoldenBrick';
import { DailyRewards } from './DailyRewards';
import { Achievements, ACHIEVEMENTS, GameStats } from './Achievements';
import { OfflineEarnings } from './OfflineEarnings';
import { StatsPanel } from './Stats';
import { Tasks, Task } from './Tasks';
```

### 3. Add New Tabs
- Add "daily", "achievements", "tasks", "stats" to panel system
- Could integrate into existing "profile" panel or add new buttons

### 4. State Initialization Updates
- DEFAULT_STATE needs new fields
- localStorage migration for existing saves
- First-time user experience

### 5. Component Integration Points

| Component | Where | Trigger |
|-----------|-------|---------|
| GoldenBrick | Main game area | Random timer, visible always |
| DailyRewards | New panel or Profile | Daily check |
| Achievements | New panel | Track on clicks/upgrades/prestige |
| OfflineEarnings | On game load | Calculate and show modal |
| StatsPanel | New panel | Display from GameState |
| Tasks | New panel | Daily reset, check on actions |

---

## Implementation Order

1. **GoldenBrick** - Easiest, visual only
2. **OfflineEarnings** - On load calculation
3. **DailyRewards** - Panel integration
4. **Achievements** - Wire into action handlers
5. **Tasks** - Wire into action handlers
6. **StatsPanel** - Display only, lowest priority

---

## Testing Checklist

- [ ] Game loads without errors
- [ ] GoldenBrick spawns and gives reward
- [ ] Offline earnings calculated and shown
- [ ] DailyRewards panel opens and allows claim
- [ ] Achievements unlock on actions
- [ ] Tasks track completion
- [ ] Stats display correct numbers
- [ ] All existing features still work
- [ ] Save/load works with new state

---

*Plan approved. Begin implementation.*
