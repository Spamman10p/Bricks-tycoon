# UI Update: Lego Cyberpunk (Handoff)

**Current Status**: **Partially Implemented (Beta)**.
**Objective**: Transition to a high-fidelity "Lego Cyberpunk" aesthetic.
**Critical Issue**: The current visual result is unacceptable ("looks bad").

## 1. Visual Target vs. Reality
- **Target**: Sleek, neon, glassmorphism, blended assets.
- **Reality**:
    - Character has a solid background (looks like a square sticker).
    - Glass panels are inconsistent or too dark.
    - Spacing is rough.

## 2. Implementation Status
- ✅ **Infrastructure**: Next.js 14 app running in `bricks-tycoon-app-1` (Port 3000).
- ✅ **Logic**: `Game.tsx` successfully transitions from 3D to 2D component layering.
- ✅ **Components**:
    - `BackgroundManager`: Layers `city-bg.png`.
    - `StatsHeader`: Fixed top bar.
    - `ClickerArea`: Squish animation active.
    - `TabBar`: Bottom navigation functional.
- ❌ **Visual Polish**: **FAILED**. Needs immediate Design Surgery.

## 3. High Priority Tasks (Design Surgeon)

### Task A: Fix Character Asset
- **Problem**: `character.jpg` is a square image with a background.
- **Action**:
    1.  **Remove Background**: Convert to Transparent PNG.
    2.  **Blend**: Ensure it sits naturally in the "Neon City" environment.

### Task B: Tune Glassmorphism
- **Problem**: `glass-panel` class in `globals.css` is too opaque/dark.
- **Action**:
    - Adjust transparency: `bg-black/60` -> `bg-black/40`?
    - Add/Tone borders: `border-white/10`.
    - Ensure text legibility vs bright neon background.

### Task C: Polish Spacing & Layout
- **Header**: Check spacing between status bar and character head.
- **Footer**: Ensure `TabBar` doesn't overlap weirdly on mobile.
- **Card**: `UpgradeCard` padding resembles a "list" rather than a "cyberpunk interface".

## 4. Technical Recovery
- **Browser Tool**: Fails with `$HOME` error. Use `curl` or server logs to verify survival.
- **Container**: `bricks-tycoon-app-1`. Restart if 404 errors appear (`docker restart bricks-tycoon-app-1`).

## 5. Original Plan (Reference)
*See `implementation_plan.md` for the technical breakdown used to reach this state.*
