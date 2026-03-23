# Game Rules

## Overview

The IPL Auction Simulator lets authenticated users create named leagues and conduct IPL-style player auctions. There are three auction modes: Regular IPL Auction, Fantasy IPL Auction, and All-Time IPL Auction. In Fantasy mode, teams earn points from an internal points database and compete on a leaderboard.

## Authentication

- Users must sign in before accessing any part of the application.
- Supported sign-in methods: Google (Gmail), Email/Password, or Username/Password.
- No anonymous or guest access is available.
- Each user has a persistent profile linked to their Firebase UID.

## Auction Modes

### Regular IPL Auction

- Uses the current IPL season's player roster.
- Standard auction rules apply (bidding, budget, squad limits).
- No points system or leaderboard.
- Results are saved and can be resumed.

### Fantasy IPL Auction

- Uses the current IPL season's player roster.
- Standard auction rules apply during the bidding phase.
- After the auction, each team earns points based on their players' real match performances.
- Points are sourced from an internal points database (populated via the Data Entry system).
- Teams are ranked on a leaderboard by total points.
- The leaderboard and team detail views are available after the auction completes.

### All-Time IPL Auction

- Uses a combined roster of players from all IPL seasons.
- Standard auction rules apply (bidding, budget, squad limits).
- No points system or leaderboard.
- Results are saved and can be resumed.

## League Setup

1. User selects an auction mode from the Main Page.
2. User enters a league name.
3. User picks a team from a 2x5 grid of IPL franchises (10 teams displayed).
4. User presses the START button to create the league and begin the auction.
5. Each league has a unique ID and tracks all teams, auction state, and results.

## Auction Rules

### Player Sets

- Players are divided into numbered sets (Set 1, Set 2, etc.).
- The auction proceeds set by set. All players in a set are presented before moving to the next.
- The current set is displayed in a sidebar on the auction screen.

### Player Presentation

When a player comes up for auction, the following details are displayed:

- **Name**
- **Matches** played
- **Innings**
- **Runs** scored
- **Average** (batting average)
- **Strike Rate** (SR)
- **Base Price**

Additional stats (wickets, economy, catches) may be shown depending on the player's role.

### Bidding

- Each player has a base price. Bidding starts at the base price.
- Bids increment by a fixed amount (configured in league settings).
- A timer circle counts down the bidding window. The timer resets with each new bid.
- Any participant can press the **BID** button to place a bid (must have sufficient budget).
- The current highest bid and bidder are displayed to all participants.

### Skip Button

- Any participant can press the **SKIP** button to pass on the current player.
- Pressing SKIP triggers a **confirmation popup** ("Are you sure you want to skip?").
- The user must confirm the skip before it takes effect.
- If all participants skip (or the timer expires with no bids), the player goes unsold.

### Selling a Player

- When the timer expires and there is at least one bid, the player is sold to the highest bidder.
- The sold price is deducted from the winning team's budget.
- The player is added to the winning team's roster.

### Unsold Players

- If no bids are placed before the timer expires (or all participants skip), the player goes unsold.
- Unsold players may be revisited in a later round depending on league settings.

### Budget Constraints

- Each team starts with a fixed budget (configured in league settings).
- A bid can only be placed if the team has enough remaining budget to cover it while still being able to fill mandatory squad positions at minimum prices.
- Remaining budgets for all teams are visible in the Info Panel on the auction screen.

### Squad Constraints

- Each team has a maximum number of players (configured in league settings).
- Additional constraints (e.g., minimum overseas players, role requirements) may apply depending on the mode.

## Fantasy Points System

### Points Database

- An internal points database stores per-match points for each player.
- Points are entered by an admin via the Data Entry page.
- Each entry records: season, match, and a mapping of player IDs to points earned.

### Points Calculation

- After the auction, each team's total points are the sum of all owned players' total points from the database.
- Points accumulate across all matches in the season.

### Leaderboard

- The leaderboard ranks all teams in the league by total points in descending order.
- Display format: rank, team name, total points (e.g., #1 RCB 10535 pts, #2 CSK 9750 pts).
- The leaderboard is scrollable and updates as new match points are entered.

### Team Detail View

- Clicking a team on the leaderboard opens the Team Detail page.
- This page shows a table with each player's name and their individual points breakdown.
- The team's total points are displayed at the top.

## Save and Resume

- The full auction state (current player, bids, sold players, budgets, round number) is continuously saved to Firebase.
- If a user disconnects or closes the browser, the auction state persists.
- Users can return to the Main Page, find their league under "Your Leagues," and resume the auction from where it left off.
- All participants see the same synced state via real-time listeners.

## Data Entry

- Accessible to admin users from the `/data-entry` route.
- Admins select a season and match, then enter points for each player.
- Submitted points are stored in the `points/` collection and immediately reflected in leaderboard calculations.
- Data entry supports bulk input for efficiency.

## Info Panel

During the auction, participants can view:

- **Other Teams' Players**: Which players each competing team has acquired so far.
- **Other Teams' Budgets**: How much budget each competing team has remaining.

This information helps participants make informed bidding decisions.
