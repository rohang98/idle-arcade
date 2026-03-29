import { describe, it, expect, vi } from 'vitest';
import {
  createInitialState,
  spawnFood,
  positionsEqual,
  collidesWithSnake,
  getOppositeDirection,
  processDirectionChange,
  tick,
} from './logic.js';
import type { SnakeState } from './types.js';

describe('positionsEqual', () => {
  it('returns true for equal positions', () => {
    expect(positionsEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
  });

  it('returns false for different positions', () => {
    expect(positionsEqual({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(false);
  });
});

describe('collidesWithSnake', () => {
  const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];

  it('detects collision with snake body', () => {
    expect(collidesWithSnake({ x: 4, y: 5 }, snake)).toBe(true);
  });

  it('detects collision with head', () => {
    expect(collidesWithSnake({ x: 5, y: 5 }, snake)).toBe(true);
  });

  it('returns false for non-colliding position', () => {
    expect(collidesWithSnake({ x: 0, y: 0 }, snake)).toBe(false);
  });

  it('skips head when skipHead is true', () => {
    expect(collidesWithSnake({ x: 5, y: 5 }, snake, true)).toBe(false);
  });

  it('still detects body collision with skipHead', () => {
    expect(collidesWithSnake({ x: 4, y: 5 }, snake, true)).toBe(true);
  });
});

describe('getOppositeDirection', () => {
  it('returns correct opposites', () => {
    expect(getOppositeDirection('up')).toBe('down');
    expect(getOppositeDirection('down')).toBe('up');
    expect(getOppositeDirection('left')).toBe('right');
    expect(getOppositeDirection('right')).toBe('left');
  });
});

describe('processDirectionChange', () => {
  it('allows perpendicular turns', () => {
    expect(processDirectionChange('right', 'up')).toBe('up');
    expect(processDirectionChange('right', 'down')).toBe('down');
    expect(processDirectionChange('up', 'left')).toBe('left');
  });

  it('prevents 180-degree turns', () => {
    expect(processDirectionChange('right', 'left')).toBe('right');
    expect(processDirectionChange('up', 'down')).toBe('up');
    expect(processDirectionChange('left', 'right')).toBe('left');
    expect(processDirectionChange('down', 'up')).toBe('down');
  });
});

describe('spawnFood', () => {
  it('returns a position within bounds', () => {
    const food = spawnFood(10, 10, []);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(10);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(10);
  });

  it('avoids positions occupied by snake', () => {
    // Fill all but one cell
    const snake = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (!(x === 2 && y === 2)) {
          snake.push({ x, y });
        }
      }
    }

    const food = spawnFood(3, 3, snake);
    expect(food).toEqual({ x: 2, y: 2 });
  });

  it('returns (0,0) when board is completely full', () => {
    const snake = [{ x: 0, y: 0 }];
    const food = spawnFood(1, 1, snake);
    expect(food).toEqual({ x: 0, y: 0 });
  });
});

describe('createInitialState', () => {
  it('creates snake at center moving right', () => {
    const state = createInitialState(20, 10);
    expect(state.snake).toHaveLength(3);
    expect(state.direction).toBe('right');
    expect(state.nextDirection).toBe('right');
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
  });

  it('places snake head at center', () => {
    const state = createInitialState(20, 10);
    const head = state.snake[0]!;
    expect(head.x).toBe(10);
    expect(head.y).toBe(5);
  });

  it('snake segments are contiguous and horizontal', () => {
    const state = createInitialState(20, 10);
    const [head, mid, tail] = state.snake;
    expect(mid!.x).toBe(head!.x - 1);
    expect(tail!.x).toBe(head!.x - 2);
    expect(mid!.y).toBe(head!.y);
    expect(tail!.y).toBe(head!.y);
  });

  it('food is not on the snake', () => {
    const state = createInitialState(20, 10);
    for (const segment of state.snake) {
      expect(positionsEqual(state.food, segment)).toBe(false);
    }
  });
});

describe('tick', () => {
  function makeState(overrides: Partial<SnakeState> = {}): SnakeState {
    return {
      snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
      food: { x: 0, y: 0 },
      direction: 'right',
      nextDirection: 'right',
      score: 0,
      isGameOver: false,
      isPaused: false,
      ...overrides,
    };
  }

  it('moves snake in current direction', () => {
    const state = makeState();
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
    expect(next.snake).toHaveLength(3);
  });

  it('tail follows head', () => {
    const state = makeState();
    const next = tick(state, 20, 10);
    expect(next.snake[1]).toEqual({ x: 5, y: 5 });
    expect(next.snake[2]).toEqual({ x: 4, y: 5 });
  });

  it('moves up', () => {
    const state = makeState({ direction: 'up', nextDirection: 'up' });
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 5, y: 4 });
  });

  it('moves down', () => {
    const state = makeState({ direction: 'down', nextDirection: 'down' });
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 5, y: 6 });
  });

  it('moves left', () => {
    const state = makeState({
      snake: [{ x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }],
      direction: 'left',
      nextDirection: 'left',
    });
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 4, y: 5 });
  });

  it('grows when eating food', () => {
    const state = makeState({ food: { x: 6, y: 5 } });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = tick(state, 20, 10);
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(10);
    vi.restoreAllMocks();
  });

  it('spawns new food after eating', () => {
    const state = makeState({ food: { x: 6, y: 5 } });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = tick(state, 20, 10);
    expect(positionsEqual(next.food, { x: 6, y: 5 })).toBe(false);
    vi.restoreAllMocks();
  });

  it('game over on right wall collision', () => {
    const state = makeState({
      snake: [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }],
    });
    const next = tick(state, 20, 10);
    expect(next.isGameOver).toBe(true);
  });

  it('game over on left wall collision', () => {
    const state = makeState({
      snake: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }],
      direction: 'left',
      nextDirection: 'left',
    });
    const next = tick(state, 20, 10);
    expect(next.isGameOver).toBe(true);
  });

  it('game over on top wall collision', () => {
    const state = makeState({
      snake: [{ x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }],
      direction: 'up',
      nextDirection: 'up',
    });
    const next = tick(state, 20, 10);
    expect(next.isGameOver).toBe(true);
  });

  it('game over on bottom wall collision', () => {
    const state = makeState({
      snake: [{ x: 5, y: 9 }, { x: 5, y: 8 }, { x: 5, y: 7 }],
      direction: 'down',
      nextDirection: 'down',
    });
    const next = tick(state, 20, 10);
    expect(next.isGameOver).toBe(true);
  });

  it('game over on self collision', () => {
    const state = makeState({
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 4 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
      ],
      direction: 'down',
      nextDirection: 'down',
    });
    const next = tick(state, 20, 10);
    expect(next.isGameOver).toBe(true);
  });

  it('returns same state when game over', () => {
    const state = makeState({ isGameOver: true });
    const next = tick(state, 20, 10);
    expect(next).toBe(state);
  });

  it('returns same state when paused', () => {
    const state = makeState({ isPaused: true });
    const next = tick(state, 20, 10);
    expect(next).toBe(state);
  });

  it('applies nextDirection on tick', () => {
    const state = makeState({ direction: 'right', nextDirection: 'up' });
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 5, y: 4 });
    expect(next.direction).toBe('up');
  });

  it('prevents 180-degree turn via nextDirection', () => {
    const state = makeState({ direction: 'right', nextDirection: 'left' });
    const next = tick(state, 20, 10);
    expect(next.snake[0]).toEqual({ x: 6, y: 5 });
    expect(next.direction).toBe('right');
  });
});
