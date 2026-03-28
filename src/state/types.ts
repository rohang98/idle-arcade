/**
 * High score entry for a game.
 */
export interface HighScoreEntry {
  score: number;
  date: string;
  duration?: number;
}

/**
 * Stored scores for all games.
 */
export type GameScores = Record<string, HighScoreEntry>;

/**
 * Usage statistics.
 */
export interface Stats {
  /** Total idle time in milliseconds */
  totalIdleTime: number;

  /** Total number of games played */
  gamesPlayed: number;

  /** Number of watch sessions */
  sessionsWatched: number;

  /** First use timestamp */
  firstUsed?: string;

  /** Last use timestamp */
  lastUsed?: string;
}
