# Architecture

## System Overview

The IPL Auction Simulator is a web application built with Next.js that lets authenticated users participate in IPL-style player auctions across three distinct modes: Regular IPL Auction, Fantasy IPL Auction, and All-Time IPL Auction. Users sign in via Google Auth, create or join named leagues, conduct auctions with real-time bidding, and compete on a points-based leaderboard in Fantasy mode.

### Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/Database**: Firebase (Firestore + Authentication)
- **Authentication**: Google Auth (Gmail / Email-Password / Username)
- **State Management**: React Context + custom hooks
- **Deployment**: Vercel

## Application Flow

```
Login (Google Auth: Gmail / Email-Password / Username)
  |
  v
Main Page
  |- 3 Auction Mode Buttons: Regular IPL | Fantasy IPL | All-Time IPL
  |- Your Leagues & Leaderboard section
  |
  +--> [Select Mode] --> Registration/Setup
  |                        |- Enter league name
  |                        |- Pick team from 2x5 grid
  |                        |- START button
  |                        v
  |                   Auction Screen
  |                        |- Player details (Name, Matches, Innings, Runs, Avg, SR)
  |                        |- Timer circle
  |                        |- Player Set sidebar
  |                        |- All Players list sidebar
  |                        |- Info panel (other teams' players & budgets)
  |                        |- BID / SKIP (with confirmation popup)
  |                        |- Save/Resume support
  |                        v
  |                   [Fantasy mode only]
  |                        |- Internal Points DB
  |                        v
  |                   Leaderboard (points-based team rankings)
  |                        v
  |                   Team Detail (player-by-player points breakdown)
  |
  +--> Data Entry (admin: enter player points per match)
```

## Authentication

### Google Auth Flow

Users authenticate through Firebase Authentication using one of three methods:

1. **Google Sign-In (Gmail)**: OAuth-based sign-in with a Google account
2. **Email/Password**: Traditional email and password registration and login
3. **Username/Password**: Username-based authentication mapped to an email address internally

All authenticated users receive a Firebase UID that links to their profile and league data. There is no anonymous access.

### Auth State Management

The `useAuth` hook manages authentication state across the application:

- `currentUser` -- Firebase User object
- `userProfile` -- Application-specific profile data from the `users/` collection
- `isAuthenticated` -- Boolean indicating login state
- `login()` / `logout()` / `register()` -- Auth action methods

Protected routes use an `AuthGuard` wrapper that redirects unauthenticated users to `/login`.

## Firebase Schema

### Firestore Collections

```
users/
  {userId}/
    displayName: string
    email: string
    avatarUrl: string
    createdAt: timestamp
    leagues: string[]                // IDs of leagues the user belongs to

leagues/
  {leagueId}/
    name: string                     // user-entered league name
    createdBy: string                // userId of creator
    mode: "regular" | "fantasy" | "alltime"
    status: "setup" | "active" | "paused" | "completed"
    createdAt: timestamp
    teams/
      {teamId}/
        name: string                 // franchise name, e.g. "RCB", "CSK"
        ownerId: string              // userId
        budget: number               // remaining budget
        players: PlayerEntry[]       // players acquired in auction
        totalPoints: number          // Fantasy mode only, summed from points DB
    auction/
      currentPlayer: PlayerData | null
      currentBid: number
      currentBidder: string | null
      timerEnd: timestamp | null
      playerSetIndex: number         // which player set is active
      status: "bidding" | "paused" | "sold" | "unsold" | "completed"
      round: number
    settings/
      totalBudget: number
      minBid: number
      bidIncrement: number
      timerDuration: number          // seconds for the timer circle
      maxPlayersPerTeam: number

players/
  {playerId}/
    name: string
    role: string                     // Batsman, Bowler, All-rounder, WK
    nationality: string
    basePrice: number
    matches: number
    innings: number
    runs: number
    average: number
    strikeRate: number
    wickets: number
    economy: number
    catches: number
    team: string                     // IPL franchise
    season: string                   // for All-Time mode filtering
    set: string                      // player set grouping (Set 1, Set 2, etc.)

points/
  {seasonId}/
    {playerId}/
      matchPoints: number[]          // per-match points array
      totalPoints: number            // sum of matchPoints
      lastUpdated: timestamp

dataEntry/
  {entryId}/
    season: string
    match: string
    playerPoints: Map<playerId, number>
    enteredBy: string                // userId of admin
    enteredAt: timestamp
```

## Route Structure

```
/                                --> Redirect to /login or /main based on auth state
/login                           --> Login page (Google / Email / Username auth)
/register                        --> Registration page for new accounts
/main                            --> Main page (3 auction mode buttons + leagues section)
/league/create                   --> League setup (enter name, pick team from 2x5 grid, START)
/league/[leagueId]               --> League lobby / resume auction
/auction/[leagueId]              --> Auction screen (full bidding interface)
/leaderboard/[leagueId]          --> Leaderboard (points-based team rankings)
/leaderboard/[leagueId]/[teamId] --> Team detail (player-by-player points table)
/data-entry                      --> Admin data entry for player points
```

## Component Architecture

### Page Components

```
LoginPage
  |- GoogleSignInButton
  |- EmailPasswordForm
  |- UsernamePasswordForm

MainPage
  |- AuctionModeCard (x3: Regular, Fantasy, All-Time) -- large buttons
  |- LeaguesAndLeaderboardSection
       |- LeagueCard (per league the user belongs to)
       |- LeaderboardPreview

LeagueSetupPage
  |- LeagueNameInput
  |- TeamGrid (2 rows x 5 columns of IPL team logos/names)
  |- StartButton

AuctionPage
  |- PlayerDetailsPanel
  |    |- PlayerName, BasePrice
  |    |- StatsTable (Matches, Innings, Runs, Average, Strike Rate)
  |- TimerCircle (countdown visualization)
  |- PlayerSetSidebar (current set display)
  |- AllPlayersList (scrollable sidebar of all players)
  |- InfoPanel
  |    |- OtherTeamsPlayers (what other teams have bought)
  |    |- OtherTeamsBudgets (remaining budgets)
  |- BidButton
  |- SkipButton --> ConfirmationPopup ("Are you sure?")
  |- CurrentBidDisplay

LeaderboardPage
  |- RankingsList (scrollable)
       |- TeamRankRow (rank number, team name, total points)
       e.g. #1 RCB 10535 pts, #2 CSK 9750 pts, ...

TeamDetailPage
  |- TeamHeader (team name, total points)
  |- PlayerPointsTable
       |- PlayerRow (player name, individual points breakdown)

DataEntryPage
  |- SeasonSelector
  |- MatchSelector
  |- PlayerPointsForm (bulk entry of points per player per match)
```

### Shared Components

```
Header / Navbar (with user avatar, logout)
AuthGuard (route protection wrapper)
LoadingSpinner
ErrorBoundary
ConfirmationModal (reusable, used by SkipButton)
Toast / Notification
```

## Data Flow

### Auction Flow

1. User selects an auction mode (Regular, Fantasy, or All-Time) on the Main Page.
2. User creates a league: enters a league name, picks a team from the 2x5 grid, and presses START.
3. Auction begins: first player from Set 1 is displayed with full stats.
4. Player details panel shows: Name, Matches, Innings, Runs, Average, Strike Rate.
5. Timer circle counts down the bidding window.
6. Users can press BID (increments current bid) or SKIP (triggers confirmation popup before committing).
7. When timer expires or all participants skip: player is sold to highest bidder or goes unsold.
8. Next player is loaded from the current set; process repeats until all sets are complete.
9. Auction state is continuously saved to Firebase for save/resume support.

### Fantasy Points Flow

1. An admin enters match-by-match player points via the Data Entry page.
2. Points are stored in the `points/` collection, keyed by season and player ID.
3. After the auction completes, each team's total points are calculated by summing owned players' points from the points database.
4. The Leaderboard page ranks teams by total points (e.g., #1 RCB 10535 pts, #2 CSK 9750 pts).
5. The Team Detail page shows a table with each player's individual points breakdown.

### Save/Resume Flow

1. Full auction state is continuously written to `leagues/{id}/auction/` in Firestore.
2. On disconnect or browser close, the state persists in Firestore.
3. When the user returns, they navigate to the league from the Main Page and resume.
4. All participants see the synced state via Firestore real-time listeners.

## Key Design Decisions

1. **Google Auth over Anonymous**: Persistent user profiles enable league membership, leaderboard identity, and cross-session continuity.
2. **League-based System**: Named leagues group users for organized competition. Each league has its own auction instance and leaderboard.
3. **Three Distinct Modes**: Regular (current season roster), Fantasy (with points database and leaderboard), and All-Time (historical players across all seasons) serve different use cases.
4. **Internal Points Database**: A separate `points/` collection populated via the Data Entry system enables real points-based Fantasy competition independent of external APIs.
5. **Firestore Real-time Listeners**: Keep auction state, bids, and leaderboard rankings synchronized across all connected participants.
6. **Save/Resume**: Full auction state persisted in Firestore allows pausing and continuing auctions across sessions without data loss.
7. **Skip with Confirmation**: A confirmation popup on the SKIP button prevents accidental skips during the auction.
