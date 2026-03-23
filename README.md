# IPL Auction Game

A multiplayer IPL Cricket Auction Game where users can create leagues, pick IPL franchises, and bid on real players in real-time with points-based scoring and leaderboards.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **Backend**: Firebase Realtime Database (serverless)
- **Auth**: Firebase Authentication (Gmail/Google login)
- **Hosting**: Vercel (frontend) + Firebase (realtime backend)

## Features

### Three Auction Modes
1. **Regular IPL Auction** — Standard auction with current IPL player pool
2. **Fantasy IPL Auction** — Points-based system with leaderboards and league rankings
3. **All-Time IPL Auction** — Legends from IPL history (2008-present)

### Core Gameplay
- User authentication with Gmail/Google sign-in
- Create named leagues, invite friends via room codes
- Pick from 10 IPL franchises (MI, CSK, RCB, KKR, DC, PBKS, RR, SRH, GT, LSG)
- Real-time bidding with configurable countdown timer
- Player stats display (name, matches, innings, runs, average, strike rate)
- Squad constraints (max 25 players, max 8 overseas)
- Purse management with tiered bid increments
- BID and SKIP actions with confirmation

### Fantasy Mode
- Internal points database for player scoring
- League leaderboard (#1 RCB — 10535 points, etc.)
- Detailed team breakdowns showing individual player point contributions
- Scrollable rankings across all leagues

### Data Persistence
- Save auction state and resume later
- Your Leagues dashboard showing active/completed auctions
- Player database shared across all auction modes

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Firebase project (Realtime Database + Google Auth enabled)

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with Firebase config
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Project Structure

```
src/
  app/          — Next.js App Router pages
  components/   — React components (ui, home, lobby, auction, squad, shared)
  lib/          — Firebase config, custom hooks, auction engine, utilities
  data/         — Static JSON data (players, teams, retentions)
  types/        — TypeScript type definitions
docs/           — Architecture, game rules, API reference
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, Firebase schema, data flow
- [Game Rules](docs/GAME-RULES.md) — Auction rules, bid increments, squad constraints
- [API Reference](docs/API-REFERENCE.md) — Firebase paths, hooks, engine functions

## App Flow

```
Login (Gmail) → Main Page → Choose Mode:
  ├── Regular IPL Auction → Player DB → Auction → Save
  ├── Fantasy IPL Auction → Player DB → Auction → Save → Leaderboard
  └── All-Time IPL Auction → Player DB → Auction → Save
```

## License

Private project — not for redistribution.
