# Architecture

## System Overview

The IPL Auction Game is a real-time multiplayer web application built with a serverless architecture. The frontend is a Next.js app that communicates directly with Firebase Realtime Database for all real-time state synchronization.

```
+------------------+       +------------------------+
|   Next.js App    |       |   Firebase Realtime DB  |
|   (Vercel)       | <---> |   (Google Cloud)        |
|                  |       |                          |
|  - Static pages  |       |  - Room state            |
|  - Room UI       |       |  - Auction state         |
|  - Auction UI    |       |  - Chat messages          |
|  - Squad mgmt    |       |  - Presence tracking      |
+------------------+       +------------------------+
        ^                           ^
        |                           |
   Browser Client            Firebase Anonymous Auth
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR/SSG for static pages, client-side for rooms |
| UI | React 19 + Tailwind CSS 4 | Component rendering + utility-first styling |
| Real-time | Firebase Realtime Database | WebSocket-based state sync across all clients |
| Auth | Firebase Anonymous Auth | Stable UIDs without user friction |
| Icons | Lucide React | Lightweight SVG icon library |
| Hosting | Vercel | Frontend deployment with edge network |

## Key Architectural Decisions

### Firebase Realtime DB over Firestore
Realtime DB has lower latency for rapid writes (bids arriving every 1-2 seconds). Firestore's 1 write/second/document limit would bottleneck the auction state node during active bidding.

### Host-Authoritative Timer
The room host's client is authoritative for timer expiry resolution. This avoids needing Cloud Functions for timer management. Trade-off: if the host disconnects, the auction stalls. Mitigation: auto-transfer host role to the next connected participant.

### Anonymous Auth
Even without user accounts, Firebase Anonymous Auth gives each browser session a stable UID. This enables:
- Security rules (only you can update your own participant data)
- Reconnection (rejoin the same slot after page refresh)
- No user friction (no signup required)

### Prices in Lakhs as Integers
All prices stored as integers in lakhs (e.g., 240 = 2.40 Cr). Avoids floating-point arithmetic issues. Display formatting converts: `240 -> "2.40 Cr"`, `50 -> "50 L"`.

### Denormalized `publicRooms/`
A separate `publicRooms/` node contains only the ~7 fields needed for the room browse page. Reading `rooms/` would download all room data (auction state, chat, etc.) for every room.

## Firebase Realtime DB Schema

```
root/
  rooms/{roomCode}/
    code: string                    # 6-char alphanumeric
    hostId: string                  # Firebase anonymous UID
    createdAt: number               # Server timestamp
    status: string                  # "lobby" | "auction" | "paused" | "completed"

    settings/
      auctionMode: string           # "ipl2026" | "mega" | "legends"
      timerDuration: number         # 5 | 10 | 15 | 20 | 25 (seconds)
      visibility: string           # "public" | "private"
      maxPlayers: number            # 2-10
      allowMidJoin: boolean
      allowSpectators: boolean

    participants/{uid}/
      displayName: string
      teamId: string | null         # null = hasn't picked yet
      isHost: boolean
      isReady: boolean
      joinedAt: number
      isConnected: boolean          # Managed via onDisconnect()

    spectators/{uid}/
      displayName: string
      joinedAt: number

    auction/
      currentSetIndex: number
      currentPlayerIndex: number
      currentPlayer/
        playerId: string
        currentBid: number          # In lakhs
        currentBidder: string       # Team ID
        bidCount: number
        status: string              # "bidding" | "sold" | "unsold"
      timer/
        expiresAt: number           # Server timestamp
        duration: number            # Configured seconds
        isPaused: boolean
      completedPlayers/{playerId}/
        soldTo: string | null       # Team ID or null
        soldPrice: number
        bidCount: number
      teams/{teamId}/
        purseRemaining: number      # In lakhs
        overseasCount: number
        slotsUsed: number
        retained/{index}: string    # Player IDs
        bought/{index}/
          playerId: string
          soldPrice: number
      totalPlayersInPool: number
      playersAuctioned: number

    chat/{messageId}/
      senderId: string
      senderName: string
      senderTeamId: string | null
      text: string
      type: string                  # "message" | "system"
      timestamp: number

    activityFeed/{eventId}/
      type: string                  # "bid" | "sold" | "unsold" | "join" | "leave"
      data: object
      timestamp: number

  publicRooms/{roomCode}/
    roomName: string
    hostName: string
    auctionMode: string
    playerCount: number
    maxPlayers: number
    status: string
    createdAt: number

  presence/{uid}/
    roomCode: string
    lastSeen: number
```

## Data Flow

### Room Creation
1. User fills form (name, team, mode, visibility)
2. Client generates 6-char room code
3. Firebase transaction checks code uniqueness
4. Writes room structure to `rooms/{code}`
5. If public, writes summary to `publicRooms/{code}`
6. Client navigates to `/rooms/{code}`

### Bidding Flow
1. Player clicks BID button
2. Client validates: sufficient purse, squad not full, overseas limit OK
3. Firebase transaction on `auction/currentPlayer`:
   - Reads current `currentBid`
   - Calculates next bid amount
   - Writes new `currentBid`, `currentBidder`, increments `bidCount`
4. Timer reset: writes new `expiresAt` = serverTimestamp + duration
5. All clients receive update via `onValue` listener
6. UI updates: bid amount, bidder badge, timer restart, activity feed entry

### Timer Expiry
1. Host's client detects timer reached 0 (via requestAnimationFrame loop)
2. Host writes resolution:
   - If `bidCount > 0`: status = "sold", updates team purse/squad
   - If `bidCount === 0`: status = "unsold"
3. After 3s overlay, host advances to next player

## Component Architecture

```
RoomPage
  ├── LobbyView (status === "lobby")
  │   ├── TeamSelector (10 IPL team slots)
  │   ├── PlayerSlotList (connected participants)
  │   ├── RoomSettings (host-only config)
  │   └── LobbyChat
  │
  └── AuctionView (status === "auction")
      ├── PlayerCard (current player being auctioned)
      ├── BidPanel (bid button + current bid display)
      ├── AuctionTimer (countdown ring)
      ├── TeamPurseBar (all teams' budgets)
      ├── SetProgress ("Set 2: Capped Indians - 5/40")
      ├── SoldOverlay / UnsoldOverlay (animations)
      ├── SquadMiniView (your current squad)
      ├── ActivityFeed (event log)
      └── AuctionChat
```
