import { describe, it, expect } from 'vitest';
import { GameRegistry } from './registry.js';
import type { GameDefinition } from './types.js';
import type { ReactElement } from 'react';

function makeGame(id: string): GameDefinition {
  return {
    metadata: {
      id,
      name: id,
      description: `${id} game`,
      author: 'test',
      version: '1.0.0',
      minDimensions: { cols: 10, rows: 10 },
      controls: 'arrows',
    },
    component: (): ReactElement => null as unknown as ReactElement,
  };
}

describe('GameRegistry', () => {
  it('registers and retrieves a game', () => {
    const registry = new GameRegistry();
    const game = makeGame('tetris');
    registry.register(game);
    expect(registry.get('tetris')).toBe(game);
  });

  it('returns undefined for unknown game', () => {
    const registry = new GameRegistry();
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('throws on duplicate registration', () => {
    const registry = new GameRegistry();
    registry.register(makeGame('snake'));
    expect(() => registry.register(makeGame('snake'))).toThrow(
      "Game 'snake' is already registered"
    );
  });

  it('getAll returns all registered games', () => {
    const registry = new GameRegistry();
    registry.register(makeGame('a'));
    registry.register(makeGame('b'));
    registry.register(makeGame('c'));
    expect(registry.getAll()).toHaveLength(3);
  });

  it('getAll returns empty array when no games registered', () => {
    const registry = new GameRegistry();
    expect(registry.getAll()).toEqual([]);
  });
});
