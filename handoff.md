# Bricks AI Tycoon - Swarm Task PRD

## Project Overview
Telegram Mini App clicker game. Currently running locally at http://localhost:3000.
The game works but has issues that need fixing before deployment.

## Current Status
- ✅ Core game mechanics working (tap, upgrades, prestige)
- ✅ Docker container running
- ✅ 3D viewer fixed (Green Cube Placeholder)
- ✅ Emoji encoding fixed
- ❌ Not deployed to Vercel yet
- ❌ Telegram bot not configured with Mini App URL
- ✅ Coin Launchpad implemented

---

## PRIORITY 1: CRITICAL FIXES

### Task 1.1: Fix ThreeDViewer TypeScript Error
- **File**: `components/ui/ThreeDViewer.tsx`
- **Problem**: `Cannot find module 'three/examples/jsm/loaders/OBJLoader'`
- **Status**: ✅ **MITIGATED** (Using Green Cube Placeholder)
- **Acceptance**: `npm run build` passes without type errors
- **Test**: `docker exec bricks-tycoon-app-1 npm run build`

### Task 1.2: Fix Emoji Encoding (Mojibake)
- **File**: `components/game/Game.tsx`
- **Problem**: Emojis display as `ðŸ¤–` instead of 🤖
- **Cause**: File was saved with wrong encoding
- **Solution**: Re-save file with UTF-8 without BOM, fix emoji strings
- **Acceptance**: Emojis render correctly in browser
- **Test**: Visual inspection at http://localhost:3000

### Task 1.3: OBJ Model Too Large
- **File**: `public/models/character.obj`
- **Problem**: 90MB is too large for web, will cause slow loading
- **Solution**: Either compress/optimize the OBJ or use GLTF/GLB format
- **Acceptance**: Model file under 5MB
- **Test**: `Get-Item public/models/*.* | Select Name, Length`

---

## PRIORITY 2: DEPLOYMENT

### Task 2.1: Initialize Git Repository
- **Location**: `bricks-tycoon/`
- **Steps**: 
  1. `git init`
  2. `git add .`
  3. `git commit -m "Initial commit"`
- **Acceptance**: Clean git status
- **Test**: `git status`

### Task 2.2: Push to GitHub
- **Repo**: https://github.com/Spamman10p/bricks-tycoon
- **Steps**:
  1. Create repo on GitHub (if not exists)
  2. `git remote add origin https://github.com/Spamman10p/bricks-tycoon.git`
  3. `git push -u origin main`
- **Acceptance**: Code visible on GitHub
- **Test**: `curl https://api.github.com/repos/Spamman10p/bricks-tycoon`

### Task 2.3: Deploy to Vercel
- **Steps**:
  1. Go to vercel.com
  2. Import GitHub repo
  3. Set environment variables from .env.example
  4. Deploy
- **Acceptance**: Live URL works (e.g., bricks-tycoon.vercel.app)
- **Test**: `curl -I https://bricks-tycoon.vercel.app`

### Task 2.4: Configure Telegram Bot
- **Bot**: @BricksAITycoonBot
- **Steps**:
  1. Message @BotFather
  2. `/mybots` → Select bot → Bot Settings → Menu Button
  3. Enter Vercel URL
- **Acceptance**: Clicking bot menu opens the game
- **Test**: Manual test in Telegram app

---

## PRIORITY 3: FEATURES

### Task 3.1: Implement Coin Launchpad
- **File**: `components/game/Game.tsx` (or new component)
- **Features**:
  - Create coin with random name/ticker
  - Simulated price chart with bonding curve
  - "JEET" (sell) or "RUG" (exit scam) buttons
  - Profit/loss calculation
- **Reference**: Original code in `Bricksclickergame.txt` lines 182-213
- **Acceptance**: Launchpad panel functional
- **Test**: Can create and trade a coin
- **Status**: ✅ **COMPLETED**

### Task 3.2: Add Wallet Connect Button (Dev Mode)
- **File**: Create `components/wallet/ConnectButton.tsx`
- **Features**:
  - "Connect Wallet" button in Profile panel
  - Mock connection in dev mode
  - Show "TEST MODE" badge
- **Acceptance**: Button appears and shows mock wallet
- **Test**: Click connect, see mock address
- **Status**: ✅ **COMPLETED**

### Task 3.3: Add Referral System
- **Files**: Update Game.tsx, create lib/referral.ts
- **Features**:
  - Generate invite link with Telegram user ID
  - Detect referral on app start
  - Award bonuses to both parties
- **Acceptance**: Invite link works, bonuses applied
- **Test**: Open link, verify bonus received
- **Status**: ✅ **COMPLETED**

---

## PRIORITY 4: POLISH

### Task 4.1: Mobile Touch Optimization
- **Problem**: May have double-tap issues or scroll conflicts
- **Solution**: Ensure touch-action: manipulation, prevent default properly
- **Test**: Test on mobile device via Telegram

### Task 4.2: Add Loading State
- **Problem**: 3D model takes time to load, no feedback
- **Solution**: Add loading spinner/skeleton while model loads
- **Test**: Slow network simulation

### Task 4.3: Add Sound Effects
- **Features**: Click sound, purchase sound, prestige sound
- **Test**: Sounds play on actions

---

## File Structure
```
bricks-tycoon/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── game/
│   │   ├── Game.tsx          # Main game logic
│   │   └── Launchpad.tsx     # [NEW] Coin Launchpad
│   ├── ui/
│   │   ├── ThreeDViewer.tsx  # [NEW] Placeholder Cube
│   │   └── ThreeDCard.tsx
│   └── wallet/
│       └── ConnectButton.tsx # [NEW] Mock Wallet
├── lib/
│   └── referral.ts           # [NEW] Referral Logic
├── public/
│   ├── images/
│   │   └── bricks-character.jpg
│   └── models/
│       └── character.obj     # NEEDS OPTIMIZATION
├── .env.local                # Secrets
├── docker-compose.yml
└── package.json
```

## Commands
```bash
# Run locally
cd bricks-tycoon && docker-compose up

# Build test
docker exec bricks-tycoon-app-1 npm run build

# Restart container
docker-compose down && docker-compose up --build
```

## Links
- GitHub: https://github.com/Spamman10p
- Telegram Bot: https://t.me/BricksAITycoonBot
- Vercel: (not deployed yet)
## Visual Progress
- **Restored**: Original Retro UI theme (Reverted Glassmorphism due to rendering issues).
- **Character**: Static Image (Optimized).
- **Fixes**: Emojis now render correctly.
