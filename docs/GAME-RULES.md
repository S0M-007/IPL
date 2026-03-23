# Game Rules

## Overview

The IPL Auction Game simulates the Indian Premier League player auction. Players create or join a room, each picking an IPL franchise, then take turns bidding on cricket players within budget and squad constraints.

## Room Setup

### Creating a Room
1. Enter your display name (max 20 characters)
2. Choose your IPL franchise (10 teams available)
3. Select an auction mode
4. Set room visibility (Public or Private)
5. Share the 6-character room code with friends

### Auction Modes

| Mode | Players | Purse | Retentions | Description |
|------|---------|-------|------------|-------------|
| IPL 2026 Mock | 350 | Variable per team | Yes, real IPL 2026 | Simulates the real IPL 2026 mini auction with actual retained squads |
| Mega Auction | 230+ | Flat 120 Cr all teams | No | Clean slate mega auction, all players available |
| Legends | 100 | 120 Cr | No | Top 100 IPL legends (batters + bowlers, 2008-2025) |

### Room Settings (Host Only)
- **Bid Timer**: 5s / 10s / 15s / 20s / 25s (default: 10s)
- **Visibility**: Public (browseable) or Private (invite-only)
- **Max Players**: 2-10 (default: 10)

## Auction Mechanics

### Player Presentation
Players are presented in organized **sets** (groupings by role and tier):

**IPL 2026 Mode Sets:**
1. Marquee (top-tier, base >= 2 Cr)
2. Capped Indians (base 1-2 Cr)
3. Capped Overseas (base 1-2 Cr)
4. Uncapped Indians (base 30-75 L)
5. All-Rounders
6. Wicket-Keepers
7. Fast Bowlers
8. Spinners
9. Remaining players
10. Accelerated Round (unsold players get a second chance at reduced base price)

### Bidding Process
1. A player card is presented showing: name, role, country, base price
2. The countdown timer starts (configured duration)
3. Any team can click **BID** to place a bid at the next increment
4. Each bid **resets the timer** to the configured duration
5. When the timer expires:
   - If at least 1 bid was placed: **SOLD** to the highest bidder
   - If no bids were placed: **UNSOLD** (skipped)

### Bid Increments

Bids increase by a fixed amount based on the current price tier:

| Current Bid | Increment | Example |
|------------|-----------|---------|
| Below 1 Cr (< 100 L) | +5 L | 30L -> 35L -> 40L |
| 1 Cr to 5 Cr (100-500 L) | +20 L | 1.00 Cr -> 1.20 Cr -> 1.40 Cr |
| Above 5 Cr (> 500 L) | +25 L | 5.00 Cr -> 5.25 Cr -> 5.50 Cr |

### Bid Restrictions
You **cannot** place a bid if:
- You are the current highest bidder (can't bid against yourself)
- Your remaining purse is insufficient (must reserve 20L per empty slot to reach 18 minimum)
- Your squad is full (25 players max)
- The player is overseas and you've reached the 8 overseas player limit

## Squad Constraints

### Squad Size
| Constraint | Limit |
|-----------|-------|
| Minimum squad size | 18 players |
| Maximum squad size | 25 players |
| Maximum overseas players | 8 |

### Player Roles
Players are categorized into 4 roles:
- **BAT** - Batsman
- **BOWL** - Bowler
- **AR** - All-Rounder
- **WK** - Wicket-Keeper

### Retained Players (IPL 2026 Mode)
Each team starts with their real IPL 2026 retained squad. These players:
- Are pre-assigned to the team
- Have their retention price deducted from the starting purse
- Count toward squad size and overseas limits
- Cannot be traded or released during the auction

### Budget (Purse)
- **IPL 2026 Mode**: Starting purse = 125 Cr minus total retention spend (varies per team)
- **Mega Auction Mode**: Flat 120 Cr for all teams
- **Legends Mode**: Flat 120 Cr for all teams

The purse decreases with each successful bid. Teams must manage their budget to fill all required squad positions.

### Purse Reserve Rule
When bidding, the system reserves enough budget to fill remaining empty slots at minimum price (20L each). This ensures teams can always reach the minimum squad size of 18.

**Example**: If you have 10 empty slots remaining, 200L (2 Cr) is reserved. Your effective bidding budget = purse remaining - reserve amount.

## Host Controls

During the auction, the host can:
- **Pause/Resume**: Temporarily halt the auction
- **Skip Player**: Mark current player as unsold and move to next
- **End Auction**: End the auction early (all remaining players go unsold)
- **Kick Player**: Remove a participant from the room

## Spectator Mode
- Anyone can join a room as a spectator
- Spectators can watch the auction and use chat
- Spectators cannot bid or pick teams
- The host can kick spectators

## Price Display Format
- Amounts under 1 Cr are shown in Lakhs: "50 L", "75 L"
- Amounts 1 Cr and above are shown in Crores: "1.00 Cr", "2.40 Cr", "14.25 Cr"
- 1 Crore = 100 Lakhs

## End of Auction
The auction ends when:
- All players in the pool have been auctioned (sold or unsold)
- The host manually ends the auction

After the auction, a summary screen shows:
- Final squad for each team
- Total spend per team
- Most expensive player
- Best value picks
