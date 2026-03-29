import type { GameDefinition } from './types.js';

export class GameRegistry {
  private games = new Map<string, GameDefinition>();

  register(game: GameDefinition): void {
    if (this.games.has(game.metadata.id)) {
      throw new Error(`Game '${game.metadata.id}' is already registered`);
    }
    this.games.set(game.metadata.id, game);
  }

  get(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  getAll(): GameDefinition[] {
    return Array.from(this.games.values());
  }
}

const registry = new GameRegistry();

export function registerGame(game: GameDefinition): void {
  registry.register(game);
}

export function getGame(id: string): GameDefinition | undefined {
  return registry.get(id);
}

export function getAllGames(): GameDefinition[] {
  return registry.getAll();
}
