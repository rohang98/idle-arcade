import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { GameScores, HighScoreEntry, Stats } from './types.js';

const CONFIG_DIR = join(homedir(), '.config', 'idl');
const SCORES_FILE = join(CONFIG_DIR, 'scores.json');
const STATS_FILE = join(CONFIG_DIR, 'stats.json');

/**
 * Ensure the config directory exists.
 */
function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Read JSON from a file, returning default value if not found.
 */
function readJson<T>(path: string, defaultValue: T): T {
  try {
    if (!existsSync(path)) {
      return defaultValue;
    }
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Write JSON to a file.
 */
function writeJson<T>(path: string, data: T): void {
  ensureConfigDir();
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ Scores ============

/**
 * Get all stored high scores.
 */
export function getScores(): GameScores {
  return readJson<GameScores>(SCORES_FILE, {});
}

/**
 * Get the high score for a specific game.
 */
export function getHighScore(gameId: string): HighScoreEntry | null {
  const scores = getScores();
  return scores[gameId] ?? null;
}

/**
 * Update the high score for a game (only if higher than existing).
 * @returns true if a new high score was set
 */
export function updateHighScore(
  gameId: string,
  score: number,
  duration?: number
): boolean {
  const scores = getScores();
  const existing = scores[gameId];

  if (existing && existing.score >= score) {
    return false;
  }

  const entry: HighScoreEntry = {
    score,
    date: new Date().toISOString(),
  };
  if (duration !== undefined) {
    entry.duration = duration;
  }
  scores[gameId] = entry;

  writeJson(SCORES_FILE, scores);
  return true;
}

// ============ Stats ============

const DEFAULT_STATS: Stats = {
  totalIdleTime: 0,
  gamesPlayed: 0,
  sessionsWatched: 0,
};

/**
 * Get usage statistics.
 */
export function getStats(): Stats {
  return readJson<Stats>(STATS_FILE, DEFAULT_STATS);
}

/**
 * Update usage statistics.
 */
export function updateStats(updates: Partial<Stats>): Stats {
  const stats = getStats();

  const updated: Stats = {
    ...stats,
    ...updates,
    lastUsed: new Date().toISOString(),
  };

  if (!updated.firstUsed && updated.lastUsed) {
    updated.firstUsed = updated.lastUsed;
  }

  writeJson(STATS_FILE, updated);
  return updated;
}

/**
 * Increment a numeric stat.
 */
export function incrementStat(
  key: 'totalIdleTime' | 'gamesPlayed' | 'sessionsWatched',
  amount = 1
): void {
  const stats = getStats();
  stats[key] += amount;
  updateStats(stats);
}

/**
 * Record a game played.
 */
export function recordGamePlayed(gameId: string, score: number, duration?: number): void {
  incrementStat('gamesPlayed');
  updateHighScore(gameId, score, duration);
}

// ============ Config Path ============

/**
 * Get the config directory path.
 */
export function getConfigDir(): string {
  return CONFIG_DIR;
}
