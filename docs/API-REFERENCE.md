# API Reference

## Firebase Database Paths

All state is managed through Firebase Firestore. There is no REST API server. Authentication is handled by Firebase Authentication (Google Auth).

### Users

```
users/{userId}
```

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | User's display name |
| `email` | string | User's email address |
| `avatarUrl` | string | Profile picture URL |
| `createdAt` | timestamp | Account creation time |
| `leagues` | string[] | Array of league IDs the user belongs to |

### Leagues

```
leagues/{leagueId}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | League name entered by the creator |
| `createdBy` | string | User ID of the league creator |
| `mode` | string | Auction mode: `"regular"`, `"fantasy"`, or `"alltime"` |
| `status` | string | `"setup"`, `"active"`, `"paused"`, or `"completed"` |
| `createdAt` | timestamp | League creation time |

### League Teams

```
leagues/{leagueId}/teams/{teamId}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Franchise name (e.g., "RCB", "CSK") |
| `ownerId` | string | User ID of the team owner |
| `budget` | number | Remaining budget |
| `players` | PlayerEntry[] | Array of acquired players |
| `totalPoints` | number | Total fantasy points (Fantasy mode only) |

### League Auction State

```
leagues/{leagueId}/auction
```

| Field | Type | Description |
|-------|------|-------------|
| `currentPlayer` | PlayerData \| null | Player currently up for auction |
| `currentBid` | number | Current highest bid amount |
| `currentBidder` | string \| null | User ID of current highest bidder |
| `timerEnd` | timestamp \| null | When the current timer expires |
| `playerSetIndex` | number | Index of the active player set |
| `status` | string | `"bidding"`, `"paused"`, `"sold"`, `"unsold"`, or `"completed"` |
| `round` | number | Current auction round |

### League Settings

```
leagues/{leagueId}/settings
```

| Field | Type | Description |
|-------|------|-------------|
| `totalBudget` | number | Starting budget per team |
| `minBid` | number | Minimum bid amount |
| `bidIncrement` | number | Fixed bid increment |
| `timerDuration` | number | Bidding timer duration in seconds |
| `maxPlayersPerTeam` | number | Maximum squad size |

### Players

```
players/{playerId}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Player's full name |
| `role` | string | Batsman, Bowler, All-rounder, or WK |
| `nationality` | string | Country of origin |
| `basePrice` | number | Starting auction price |
| `matches` | number | Total matches played |
| `innings` | number | Total innings |
| `runs` | number | Total runs scored |
| `average` | number | Batting average |
| `strikeRate` | number | Batting strike rate |
| `wickets` | number | Total wickets taken |
| `economy` | number | Bowling economy rate |
| `catches` | number | Total catches |
| `team` | string | IPL franchise name |
| `season` | string | IPL season (for All-Time mode filtering) |
| `set` | string | Player set grouping (Set 1, Set 2, etc.) |

### Points (Fantasy Mode)

```
points/{seasonId}/{playerId}
```

| Field | Type | Description |
|-------|------|-------------|
| `matchPoints` | number[] | Array of points earned per match |
| `totalPoints` | number | Sum of all match points |
| `lastUpdated` | timestamp | When points were last updated |

### Data Entry

```
dataEntry/{entryId}
```

| Field | Type | Description |
|-------|------|-------------|
| `season` | string | IPL season identifier |
| `match` | string | Match identifier |
| `playerPoints` | Map | Map of player IDs to points earned in the match |
| `enteredBy` | string | User ID of the admin who entered the data |
| `enteredAt` | timestamp | Submission timestamp |

## React Hooks

### useAuth

Manages authentication state and actions.

```typescript
const {
  currentUser,      // Firebase User object or null
  userProfile,      // UserProfile from users/ collection or null
  isAuthenticated,  // boolean
  isLoading,        // boolean, true while auth state resolving
  login,            // (method: 'google' | 'email' | 'username', credentials?) => Promise<void>
  logout,           // () => Promise<void>
  register,         // (email: string, password: string, displayName: string) => Promise<void>
} = useAuth();
```

### useLeague

Manages league state including creation, joining, and real-time sync.

```typescript
const {
  league,           // League object or null
  teams,            // TeamData[] for all teams in the league
  isLoading,        // boolean
  createLeague,     // (name: string, mode: AuctionMode, teamId: string) => Promise<string>
  joinLeague,       // (leagueId: string, teamId: string) => Promise<void>
} = useLeague(leagueId?: string);
```

### useAuction

Manages auction state with real-time Firestore listeners.

```typescript
const {
  auctionState,     // AuctionState object (currentPlayer, currentBid, status, etc.)
  isLoading,        // boolean
  placeBid,         // () => Promise<void> -- places a bid at currentBid + increment
  skipPlayer,       // () => Promise<void> -- confirms and skips current player
  pauseAuction,     // () => Promise<void>
  resumeAuction,    // () => Promise<void>
  nextPlayer,       // () => Promise<void> -- advances to next player in set
} = useAuction(leagueId: string);
```

### usePlayerDatabase

Fetches and filters the player database.

```typescript
const {
  players,          // PlayerData[] -- all players (or filtered by mode)
  playerSets,       // Map<string, PlayerData[]> -- players grouped by set
  isLoading,        // boolean
  getPlayersBySet,  // (setName: string) => PlayerData[]
  getPlayerById,    // (playerId: string) => PlayerData | null
} = usePlayerDatabase(mode: AuctionMode);
```

### useLeaderboard

Fetches leaderboard data for a league (Fantasy mode).

```typescript
const {
  rankings,         // TeamRanking[] -- sorted by totalPoints descending
  isLoading,        // boolean
  refreshRankings,  // () => Promise<void>
} = useLeaderboard(leagueId: string);
```

**TeamRanking type:**

```typescript
interface TeamRanking {
  rank: number;          // 1-based rank
  teamId: string;
  teamName: string;      // e.g., "RCB"
  totalPoints: number;   // e.g., 10535
  ownerId: string;
}
```

### useTeamDetail

Fetches a team's player-by-player points breakdown.

```typescript
const {
  team,             // TeamData object
  playerPoints,     // PlayerPointsEntry[] -- each player's points breakdown
  totalPoints,      // number
  isLoading,        // boolean
} = useTeamDetail(leagueId: string, teamId: string);
```

**PlayerPointsEntry type:**

```typescript
interface PlayerPointsEntry {
  playerId: string;
  playerName: string;
  matchPoints: number[];   // per-match points
  totalPoints: number;
}
```

### useTimer

Manages the countdown timer circle for the auction.

```typescript
const {
  timeRemaining,    // number -- seconds left
  isRunning,        // boolean
  progress,         // number -- 0 to 1, for the circular timer display
  startTimer,       // (durationSeconds: number) => void
  resetTimer,       // () => void
} = useTimer();
```

### useDataEntry

Manages admin data entry for player points.

```typescript
const {
  submitPoints,     // (season: string, match: string, playerPoints: Map<string, number>) => Promise<void>
  isSubmitting,     // boolean
} = useDataEntry();
```

## TypeScript Types

### AuctionMode

```typescript
type AuctionMode = "regular" | "fantasy" | "alltime";
```

### AuctionStatus

```typescript
type AuctionStatus = "bidding" | "paused" | "sold" | "unsold" | "completed";
```

### LeagueStatus

```typescript
type LeagueStatus = "setup" | "active" | "paused" | "completed";
```

### PlayerData

```typescript
interface PlayerData {
  id: string;
  name: string;
  role: string;
  nationality: string;
  basePrice: number;
  matches: number;
  innings: number;
  runs: number;
  average: number;
  strikeRate: number;
  wickets: number;
  economy: number;
  catches: number;
  team: string;
  season: string;
  set: string;
}
```

### PlayerEntry

```typescript
interface PlayerEntry {
  playerId: string;
  playerName: string;
  soldPrice: number;
  role: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  createdAt: Timestamp;
  leagues: string[];
}
```

### League

```typescript
interface League {
  id: string;
  name: string;
  createdBy: string;
  mode: AuctionMode;
  status: LeagueStatus;
  createdAt: Timestamp;
}
```

### TeamData

```typescript
interface TeamData {
  id: string;
  name: string;
  ownerId: string;
  budget: number;
  players: PlayerEntry[];
  totalPoints: number;
}
```

### AuctionState

```typescript
interface AuctionState {
  currentPlayer: PlayerData | null;
  currentBid: number;
  currentBidder: string | null;
  timerEnd: Timestamp | null;
  playerSetIndex: number;
  status: AuctionStatus;
  round: number;
}
```
