import type { GameDefinition, GameMetadata } from './types.js';

/**
 * Registry for all available games.
 * Games self-register by calling `registerGame()`.
 *
 * @example Adding a new game:
 * ```typescript
 * // In src/games/tetris/index.ts
 * import { registerGame } from '../registry.js';
 * import { TetrisGame } from './TetrisGame.js';
 *
 * registerGame({
 *   metadata: {
 *     id: 'tetris',
 *     name: 'Tetris',
 *     description: 'Classic block-stacking puzzle game',
 *     author: 'Your Name',
 *     version: '1.0.0',
 *     minDimensions: { cols: 20, rows: 20 },
 *     controls: '← → to move, ↑ to rotate, ↓ to drop',
 *   },
 *   component: TetrisGame,
 * });
 * ```
 */
class GameRegistry {
  private games = new Map<string, GameDefinition>();

  /**
   * Register a game with the system.
   * @throws Error if a game with the same ID is already registered
   */
  register(game: GameDefinition): void {
    if (this.games.has(game.metadata.id)) {
      throw new Error(`Game '${game.metadata.id}' is already registered`);
    }
    this.games.set(game.metadata.id, game);
  }

  /**
   * Get a game by its ID.
   * @returns The game definition or undefined if not found
   */
  get(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  /**
   * Get all registered games.
   * @returns Array of all game definitions
   */
  getAll(): GameDefinition[] {
    return Array.from(this.games.values());
  }

  /**
   * Get metadata for all registered games.
   * Useful for listing available games without loading components.
   */
  getAllMetadata(): GameMetadata[] {
    return this.getAll().map((g) => g.metadata);
  }

  /**
   * Check if a game exists by ID.
   */
  has(id: string): boolean {
    return this.games.has(id);
  }

  /**
   * Get a random game from the registry.
   * Useful for auto-launching games on idle.
   */
  getRandom(): GameDefinition | undefined {
    const games = this.getAll();
    if (games.length === 0) return undefined;
    const index = Math.floor(Math.random() * games.length);
    return games[index];
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();

/**
 * Register a game with the global registry.
 * Call this from your game's entry file.
 */
export function registerGame(game: GameDefinition): void {
  gameRegistry.register(game);
}

/**
 * Get a game by ID from the global registry.
 */
export function getGame(id: string): GameDefinition | undefined {
  return gameRegistry.get(id);
}

/**
 * Get all registered games from the global registry.
 */
export function getAllGames(): GameDefinition[] {
  return gameRegistry.getAll();
}
