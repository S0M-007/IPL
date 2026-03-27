/**
 * Test Bots Script
 *
 * Simulates multiple users joining a room, selecting teams, and bidding in an auction.
 *
 * Usage:
 *   node scripts/test-bots.mjs [--base-url <url>] [--bots <count>]
 *
 * Examples:
 *   node scripts/test-bots.mjs                          # 3 bots against local dev
 *   node scripts/test-bots.mjs --base-url https://project-upskill.vercel.app --bots 4
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Load env ───────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    let val = trimmed.slice(eqIdx + 1);
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[key] = process.env[key] || val;
  }
}

loadEnv();

// ─── Firebase Admin setup ───────────────────────────────────
const admin = await import('firebase-admin');

if (!admin.default.apps.length) {
  admin.default.initializeApp({
    credential: admin.default.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const adminAuth = admin.default.auth();

// ─── Config ─────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const BASE_URL = getArg('base-url', 'http://localhost:3000');
const BOT_COUNT = parseInt(getArg('bots', '3'), 10);
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const TEAM_IDS = ['mi', 'csk', 'rcb', 'kkr', 'dc', 'pbks', 'rr', 'srh', 'gt', 'lsg'];

const BOT_NAMES = [
  'Dhoni Bot', 'Kohli Bot', 'Rohit Bot', 'Bumrah Bot',
  'SKY Bot', 'Jadeja Bot', 'Pant Bot', 'Gill Bot',
  'Hardik Bot', 'Rashid Bot',
];

// ─── Helpers ────────────────────────────────────────────────
function log(prefix, msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] [${prefix}] ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getIdTokenFromCustomToken(customToken) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.idToken;
}

async function api(path, token, method = 'POST', body = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API ${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// ─── Bot class ──────────────────────────────────────────────
class Bot {
  constructor(index) {
    this.index = index;
    this.name = BOT_NAMES[index] || `Bot ${index + 1}`;
    this.uid = `bot-${index}-${Date.now()}`;
    this.teamId = TEAM_IDS[index];
    this.token = null;
  }

  log(msg) {
    log(this.name, msg);
  }

  async init() {
    // Create or get Firebase user
    try {
      await adminAuth.getUser(this.uid);
    } catch {
      await adminAuth.createUser({
        uid: this.uid,
        displayName: this.name,
        email: `${this.uid}@test-bots.local`,
      });
    }

    const customToken = await adminAuth.createCustomToken(this.uid);
    this.token = await getIdTokenFromCustomToken(customToken);
    this.log(`Authenticated (team: ${this.teamId})`);
  }

  async joinRoom(roomCode) {
    await api(`/api/rooms/${roomCode}/join`, this.token, 'POST', { teamId: this.teamId });
    this.log(`Joined room ${roomCode} with team ${this.teamId}`);
  }

  async placeBid(roomCode) {
    try {
      const result = await api(`/api/rooms/${roomCode}/auction/bid`, this.token);
      this.log(`Placed bid: ${result.bid}`);
      return true;
    } catch (e) {
      // Expected when bot can't bid (budget, already highest, etc.)
      return false;
    }
  }

  async cleanup() {
    try {
      await adminAuth.deleteUser(this.uid);
      this.log('Cleaned up Firebase user');
    } catch {
      // ignore
    }
  }
}

// ─── Host Bot (creates room, controls auction) ──────────────
class HostBot extends Bot {
  constructor() {
    super(0);
    this.name = 'Host Bot';
    this.roomCode = null;
  }

  async createRoom() {
    const result = await api('/api/rooms', this.token, 'POST', {
      mode: 'speed',
      timerDuration: 10,
      visibility: 'public',
      maxPlayers: BOT_COUNT + 1,
    });
    this.roomCode = result.code;
    this.log(`Created room: ${this.roomCode}`);
    return this.roomCode;
  }

  async selectTeam(roomCode) {
    await api(`/api/rooms/${roomCode}/join`, this.token, 'POST', { teamId: this.teamId });
    this.log(`Selected team ${this.teamId}`);
  }

  async startAuction(roomCode) {
    await api(`/api/rooms/${roomCode}/auction/start`, this.token);
    this.log('Auction started!');
  }

  async resolvePlayer(roomCode) {
    const result = await api(`/api/rooms/${roomCode}/auction/resolve`, this.token);
    this.log(`Resolved player: ${result.sold ? 'SOLD' : 'UNSOLD'}`);
    return result;
  }

  async advancePlayer(roomCode) {
    const result = await api(`/api/rooms/${roomCode}/auction/advance`, this.token);
    if (result.completed) {
      this.log('Auction completed!');
    } else {
      this.log(`Advanced to next player: ${result.nextPlayer || 'unknown'}`);
    }
    return result;
  }

  async pauseAuction(roomCode) {
    await api(`/api/rooms/${roomCode}/auction/pause`, this.token);
    this.log('Auction paused');
  }

  async resumeAuction(roomCode) {
    await api(`/api/rooms/${roomCode}/auction/resume`, this.token);
    this.log('Auction resumed');
  }

  async endAuction(roomCode) {
    await api(`/api/rooms/${roomCode}/auction/end`, this.token);
    this.log('Auction force-ended');
  }
}

// ─── Main simulation ────────────────────────────────────────
async function runSimulation() {
  console.log('\n====================================');
  console.log('  IPL Auction - Test Bots');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Bots: ${BOT_COUNT} players + 1 host`);
  console.log('====================================\n');

  const host = new HostBot();
  const bots = Array.from({ length: BOT_COUNT }, (_, i) => new Bot(i + 1));
  const allBots = [host, ...bots];

  try {
    // 1. Initialize all bots (create Firebase users + get tokens)
    log('SETUP', 'Creating bot accounts...');
    await Promise.all(allBots.map((b) => b.init()));

    // 2. Host creates room
    log('SETUP', 'Creating room...');
    const roomCode = await host.createRoom();
    await host.selectTeam(roomCode);

    // 3. Bots join room with teams
    log('SETUP', 'Bots joining room...');
    for (const bot of bots) {
      await bot.joinRoom(roomCode);
      await sleep(300);
    }

    // 4. Start auction
    log('AUCTION', 'Starting auction...');
    await sleep(1000);
    await host.startAuction(roomCode);

    // 5. Simulate bidding rounds
    const MAX_PLAYERS = 15; // Simulate first 15 players only
    let completed = false;

    for (let playerNum = 0; playerNum < MAX_PLAYERS && !completed; playerNum++) {
      log('AUCTION', `\n--- Player ${playerNum + 1} ---`);
      await sleep(500);

      // Simulate bidding — each bot has a random chance of bidding, with random delays
      const rounds = 2 + Math.floor(Math.random() * 4); // 2-5 bidding rounds per player

      for (let round = 0; round < rounds; round++) {
        // Pick a random bot to try bidding
        const bidder = allBots[Math.floor(Math.random() * allBots.length)];
        await sleep(300 + Math.random() * 700);
        await bidder.placeBid(roomCode);
      }

      // Host resolves the player
      await sleep(500);
      await host.resolvePlayer(roomCode);

      // Host advances to next
      await sleep(300);
      const advance = await host.advancePlayer(roomCode);
      completed = advance.completed;
    }

    if (!completed) {
      log('AUCTION', 'Ending auction early (bot test limit reached)...');
      await host.endAuction(roomCode);
    }

    console.log('\n====================================');
    console.log('  Simulation Complete!');
    console.log(`  Room code: ${roomCode}`);
    console.log(`  View at: ${BASE_URL}/rooms/${roomCode}`);
    console.log('====================================\n');

  } finally {
    // Cleanup bot users
    log('CLEANUP', 'Removing bot accounts...');
    await Promise.all(allBots.map((b) => b.cleanup()));
    log('CLEANUP', 'Done!');
  }

  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('\nSimulation failed:', err.message);
  process.exit(1);
});
