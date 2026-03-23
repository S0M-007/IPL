# IPL Auction Game

A full-featured, real-time multiplayer IPL Cricket Auction Game where friends can create rooms, pick IPL franchises, and bid on real cricket players with countdown timers, squad constraints, and live chat.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS 4
- **Backend**: Firebase Realtime Database (serverless)
- **Auth**: Firebase Anonymous Authentication
- **Hosting**: Vercel (frontend) + Firebase (realtime backend)

## Features

- **Room System**: Create/join rooms with 6-character codes, public or private
- **Team Selection**: Pick from 10 IPL franchises (MI, CSK, RCB, KKR, DC, PBKS, RR, SRH, GT, LSG)
- **Live Auction**: Real-time bidding with configurable countdown timers (5-25s)
- **Squad Management**: Pre-populated retentions, overseas limits, budget tracking
- **Multiple Modes**: IPL 2026 Mock Auction, Mega Auction, Legends Auction
- **Chat & Activity**: Real-time chat with GIF support, live activity feed
- **Sound Effects**: Bid, sold, unsold, timer warning sounds

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (Realtime Database + Anonymous Auth enabled)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd ipl-auction-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/          - Next.js App Router pages
  components/   - React components (ui, home, lobby, auction, squad, shared)
  lib/          - Firebase config, custom hooks, auction engine, utilities
  data/         - Static JSON data (players, teams, retentions, auction sets)
  types/        - TypeScript type definitions
docs/           - Architecture, game rules, API reference
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design, tech stack, Firebase schema
- [Game Rules](docs/GAME-RULES.md) - Auction mechanics, bid increments, squad constraints
- [API Reference](docs/API-REFERENCE.md) - Firebase paths, hooks, engine functions

## License

MIT
