import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { GameScores, HighScoreEntry, Stats } from './types.js';

const CONFIG_DIR = join(homedir(), '.config', 'idle-arcade');
const SCORES_FILE = join(CONFIG_DIR, 'scores.json');
const STATS_FILE = join(CONFIG_DIR, 'stats.json');

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readJson<T>(path: string, defaultValue: T): T {
  try {
    if (!existsSync(path)) return defaultValue;
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson<T>(path: string, data: T): void {
  ensureConfigDir();
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

export function getScores(): GameScores {
  return readJson<GameScores>(SCORES_FILE, {});
}

export function getHighScore(gameId: string): HighScoreEntry | null {
  return getScores()[gameId] ?? null;
}

export function updateHighScore(
  gameId: string,
  score: number,
  duration?: number
): boolean {
  const scores = getScores();
  const existing = scores[gameId];

  if (existing && existing.score >= score) return false;

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

const DEFAULT_STATS: Stats = {
  totalIdleTime: 0,
  gamesPlayed: 0,
  sessionsWatched: 0,
};

export function getStats(): Stats {
  return readJson<Stats>(STATS_FILE, DEFAULT_STATS);
}

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

export function incrementStat(
  key: 'totalIdleTime' | 'gamesPlayed' | 'sessionsWatched',
  amount = 1
): void {
  const stats = getStats();
  stats[key] += amount;
  updateStats(stats);
}

export function recordGamePlayed(gameId: string, score: number, duration?: number): boolean {
  incrementStat('gamesPlayed');
  return updateHighScore(gameId, score, duration);
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
