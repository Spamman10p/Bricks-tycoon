# 🧱 Bricks AI Tycoon

A Telegram Mini App clicker game where you tap to earn, launch meme coins, and STOP BEING POOR!

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Your Telegram Bot token (from @BotFather)

### 1. Setup Environment
```bash
cd bricks-tycoon
cp .env.example .env.local
```

Edit `.env.local` and add your bot token.

### 2. Build and Run
```bash
# Development mode (with hot reload)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Game
Open http://localhost:3000 in your browser.

## 📱 Testing in Telegram

1. Message @BotFather
2. Send `/mybots` → Select your bot
3. Select "Bot Settings" → "Menu Button" or "Configure Mini App"
4. Enter your deployed URL (after deploying to Vercel)

## 🛠️ Development Commands

```bash
# Start development server
docker-compose up

# Rebuild after changes to package.json
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

## 📦 Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Set environment variables
5. Deploy!

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather |
| `NEXT_PUBLIC_DEV_MODE` | Set to `true` for testing |
| `NEXT_PUBLIC_PHANTOM_APP_ID` | From phantom.com/portal |

## 📁 Project Structure

```
bricks-tycoon/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout with Telegram SDK
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/
│   └── game/
│       └── Game.tsx    # Main game component
├── types/
│   └── index.ts        # TypeScript types
├── public/
│   └── images/         # Game assets
├── Dockerfile          # Development Dockerfile
├── Dockerfile.prod     # Production Dockerfile
└── docker-compose.yml  # Docker Compose config
```

## 🎮 Game Features

- ✅ Tap to earn Bricks Bux
- ✅ Idle income generation
- ✅ 5 upgrades to buy
- ✅ 4 luxury assets (Lambo, Yacht, etc.)
- ✅ 3 employees for automation
- ✅ Prestige system (Exit Scam)
- 🔜 Coin launch simulator
- 🔜 Telegram Cloud Storage
- 🔜 Phantom wallet integration
- 🔜 Token holder verification

## 📄 License

MIT
