# Task: Create Atomic UI Components

**Context**: We are rebranding "Bricks Tycoon" to "Lego Cyberpunk". You are responsible for the atomic React components.

**Design System**:
- **Glassmorphism**: Use `bg-black/40 backdrop-blur-md border-white/10` for panels.
- **Font**: Use Default Orbitron/Cyberpunk if available, otherwise Sans.
- **Colors**: Neon Yellow, Cyan, Magenta accents.
- **Images**:
    - Character: `/images/character.jpg`
    - Background: `/images/city-bg.png`

## Sub-Task 1: StatsHeader
**File**: `components/game/StatsHeader.tsx`
**Requirements**:
- Fixed to TOP of screen (`fixed top-0 left-0 right-0 z-50`).
- Display `Balance` (e.g., "$ 1,234,567") and `Profit/Sec` (e.g., "+ $100/s").
- Use `glass-panel` style.

## Sub-Task 2: ClickerArea
**File**: `components/game/ClickerArea.tsx`
**Requirements**:
- Centered in the screen (vertically and horizontally).
- Render `Image` (Next.js) pointing to `/images/character.jpg`.
- **Interaction**: On click, scale down briefly (`active:scale-95 transition-transform`).
- **Effect**: Emit a floating number (optional, or just the callback).
- Props: `onClick: () => void`.

## Sub-Task 3: TabBar
**File**: `components/game/TabBar.tsx`
**Requirements**:
- Fixed to BOTTOM of screen (`fixed bottom-0 left-0 right-0 z-50`).
- 4 Tabs: "Earn" (Clicker), "City" (Upgrades), "Social" (Friends), "Airdrop" (Wallet).
- Active tab should be highlighted (Neon text).
- Use `glass-panel` style.
- Props: `activeTab: string`, `onTabChange: (tab: string) => void`.

## Sub-Task 4: UpgradeCard
**File**: `components/ui/UpgradeCard.tsx`
**Requirements**:
- Reusable row component.
- Left: Icon/Image box.
- Middle: Title and Level.
- Right: Buy Button (Price).
- Style: `glass-panel` with hover effects.

**Deliverable**:
- Create/Overwrite these 4 files with clean, functional TSX code.
- Ensure no import errors (imports `react`, `next/image`).
