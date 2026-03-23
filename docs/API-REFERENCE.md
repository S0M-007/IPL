# API Reference

## Firebase Database Paths

All real-time state is managed through Firebase Realtime Database. There is no REST API server.

### Room Paths

| Path | Type | Description |
|------|------|-------------|
| `rooms/{roomCode}` | Object | Full room state |
| `rooms/{roomCode}/status` | String | `"lobby"` / `"auction"` / `"paused"` / `"completed"` |
| `rooms/{roomCode}/hostId` | String | UID of the room creator |
| `rooms/{roomCode}/settings` | Object | Room configuration |
| `rooms/{roomCode}/participants/{uid}` | Object | Connected player data |
| `rooms/{roomCode}/spectators/{uid}` | Object | Spectator data |

### Auction Paths

| Path | Type | Description |
|------|------|-------------|
| `rooms/{roomCode}/auction/currentPlayer` | Object | Player currently being auctioned |
| `rooms/{roomCode}/auction/currentPlayer/currentBid` | Number | Current highest bid (in lakhs) |
| `rooms/{roomCode}/auction/currentPlayer/currentBidder` | String | Team ID of highest bidder |
| `rooms/{roomCode}/auction/currentPlayer/bidCount` | Number | Total bids on this player |
| `rooms/{roomCode}/auction/currentPlayer/status` | String | `"bidding"` / `"sold"` / `"unsold"` |
| `rooms/{roomCode}/auction/timer/expiresAt` | Number | Server timestamp when timer expires |
| `rooms/{roomCode}/auction/timer/isPaused` | Boolean | Whether timer is paused |
| `rooms/{roomCode}/auction/teams/{teamId}` | Object | Team's auction state (purse, squad) |
| `rooms/{roomCode}/auction/completedPlayers/{playerId}` | Object | Resolved player (sold/unsold) |

### Chat Paths

| Path | Type | Description |
|------|------|-------------|
| `rooms/{roomCode}/chat/{messageId}` | Object | Chat message |
| `rooms/{roomCode}/activityFeed/{eventId}` | Object | System event (bid, sold, join, etc.) |

### Public Room Index

| Path | Type | Description |
|------|------|-------------|
| `publicRooms/{roomCode}` | Object | Lightweight room summary for browse page |

### Presence

| Path | Type | Description |
|------|------|-------------|
| `presence/{uid}` | Object | User's current room and last seen time |
| `.info/connected` | Boolean | Firebase connection state |
| `.info/serverTimeOffset` | Number | Clock skew between client and server (ms) |

---

## Custom Hooks

### `useRoom(roomCode: string)`
Subscribe to room state and manage participation.

**Returns:**
```typescript
{
  room: Room | null;              // Full room data
  participants: Participant[];    // Connected players
  spectators: Spectator[];        // Spectators
  isHost: boolean;                // Whether current user is host
  myTeamId: string | null;        // Current user's team
  loading: boolean;
  error: string | null;
  // Mutations
  joinRoom: (displayName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  toggleReady: () => Promise<void>;
  kickParticipant: (uid: string) => Promise<void>;
  updateSettings: (settings: Partial<RoomSettings>) => Promise<void>;
}
```

### `useAuction(roomCode: string)`
Subscribe to auction state.

**Returns:**
```typescript
{
  auctionState: AuctionState | null;
  currentPlayer: Player | null;       // Full player data (joined with static data)
  teams: Record<string, TeamAuctionState>;
  timerRemaining: number;             // Seconds remaining
  timerPercentage: number;            // 0-100 for progress bar
  isTimerWarning: boolean;            // True when < 3s
  playersAuctioned: number;
  totalPlayers: number;
  currentSetName: string;
  // Host-only mutations
  startAuction: () => Promise<void>;
  pauseAuction: () => Promise<void>;
  resumeAuction: () => Promise<void>;
  skipPlayer: () => Promise<void>;
  endAuction: () => Promise<void>;
  nextPlayer: () => Promise<void>;
}
```

### `useBidding(roomCode: string)`
Handle bid submission with validation.

**Returns:**
```typescript
{
  placeBid: () => Promise<void>;      // Submit a bid
  canBid: boolean;                     // Whether current user can bid
  bidReason: string | null;            // Why bidding is disabled
  nextBidAmount: number;               // What the next bid would be (in lakhs)
  myPurse: number;                     // Current user's remaining purse
}
```

### `useTimer(expiresAt: number, duration: number, isPaused: boolean)`
Client-side countdown synchronized with server time.

**Returns:**
```typescript
{
  secondsRemaining: number;           // Countdown value
  percentage: number;                  // 0-100 for visual display
  isWarning: boolean;                  // True when < 3s
  isExpired: boolean;                  // True when timer hit 0
}
```

### `useChat(roomCode: string)`
Real-time chat messaging.

**Returns:**
```typescript
{
  messages: ChatMessage[];             // Last 100 messages
  sendMessage: (text: string) => Promise<void>;
  sendGif: (gifUrl: string) => Promise<void>;
}
```

### `useSquad(roomCode: string, teamId: string)`
Derived squad state with constraint checks.

**Returns:**
```typescript
{
  retained: Player[];                  // Retained players with full data
  bought: (Player & { soldPrice: number })[];  // Bought players
  totalPlayers: number;
  overseasCount: number;
  slotsRemaining: number;
  purseRemaining: number;
  purseSpent: number;
  isSquadFull: boolean;                // >= 25 players
  isOverseasFull: boolean;             // >= 8 overseas
  canBuyMore: boolean;                 // Has budget + slots
}
```

### `useSound()`
Sound effect management.

**Returns:**
```typescript
{
  playBid: () => void;
  playSold: () => void;
  playUnsold: () => void;
  playWarning: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}
```

### `useRoomPresence(roomCode: string)`
Online/offline tracking.

**Returns:**
```typescript
{
  isConnected: boolean;                // Current connection state
  onlineCount: number;                 // Number of connected users
}
```

---

## Engine Functions

### `bid-calculator.ts`

```typescript
// Get the next bid amount based on current bid
getNextBidAmount(currentBid: number): number

// Check if a team can place a bid
canTeamBid(team: TeamAuctionState, bidAmount: number, player: Player): {
  allowed: boolean;
  reason?: string;
}
```

### `auction-engine.ts`

```typescript
// Initialize auction state for a room
initializeAuction(roomCode: string, auctionMode: string): Promise<void>

// Present the next player from the current set
presentNextPlayer(roomCode: string): Promise<void>

// Process a bid from a team
processBid(roomCode: string, teamId: string): Promise<void>

// Resolve the current player (sold or unsold)
resolveCurrentPlayer(roomCode: string): Promise<void>
```

### `squad-validator.ts`

```typescript
// Validate squad constraints after a hypothetical purchase
validateSquad(team: TeamAuctionState, player: Player): {
  valid: boolean;
  violations: string[];
}
```

### `set-manager.ts`

```typescript
// Get the ordered list of players for a given auction mode
getAuctionOrder(mode: string): string[]  // Array of player IDs

// Get current set info
getCurrentSet(setIndex: number, mode: string): {
  name: string;
  playerIds: string[];
  totalPlayers: number;
}

// Advance to next player/set
getNextPlayerIndex(currentSetIndex: number, currentPlayerIndex: number, mode: string): {
  setIndex: number;
  playerIndex: number;
  isComplete: boolean;  // True if all sets exhausted
}
```

### `timer-manager.ts`

```typescript
// Calculate new expiry timestamp
getNewExpiry(duration: number): number  // Returns server-adjusted timestamp

// Get remaining seconds from expiry
getSecondsRemaining(expiresAt: number, serverOffset: number): number
```

---

## Utility Functions

### `room-code.ts`
```typescript
generateRoomCode(): string  // Returns 6-char alphanumeric code (excludes I, O, 0, 1)
```

### `price-formatter.ts`
```typescript
formatPrice(lakhs: number): string       // 240 -> "2.40 Cr", 50 -> "50 L"
formatPriceFull(lakhs: number): string   // 240 -> "2 Crore 40 Lakhs"
```

### `constants.ts`
```typescript
BID_INCREMENT_TIERS: { maxBid: number; increment: number }[]
TIMER_OPTIONS: number[]              // [5, 10, 15, 20, 25]
MAX_SQUAD_SIZE: number               // 25
MIN_SQUAD_SIZE: number               // 18
MAX_OVERSEAS: number                  // 8
DEFAULT_PURSE: number                 // 12500 (125 Cr in lakhs)
```

### `team-colors.ts`
```typescript
TEAM_COLORS: Record<string, { primary: string; secondary: string; gradient: string }>
```
