export * from './games/types.js';
export * from './games/registry.js';

export * from './display/types.js';
export { displayManager } from './display/index.js';

export * from './detector/types.js';
export { IdleDetector } from './detector/index.js';
export { SocketServer } from './detector/socket-server.js';

export type { HighScoreEntry, Stats, GameScores } from './state/types.js';
export * from './state/storage.js';
