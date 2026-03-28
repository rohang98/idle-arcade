/**
 * idl - Terminal games for Claude Code idle time
 *
 * This is the main library entry point for programmatic usage.
 * For CLI usage, see src/cli/index.ts
 */

// Games
export * from './games/types.js';
export * from './games/registry.js';

// Display
export * from './display/types.js';
export { displayManager } from './display/index.js';

// Detection
export * from './detector/types.js';
export { IdleDetector } from './detector/index.js';
export { SocketServer } from './detector/socket-server.js';

// State
export type { HighScoreEntry, Stats } from './state/types.js';
export type { GameScores } from './state/types.js';
export * from './state/storage.js';
