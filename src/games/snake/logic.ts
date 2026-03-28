import type { Direction, Position, SnakeState } from './types.js';

/**
 * Create initial snake state.
 */
export function createInitialState(cols: number, rows: number): SnakeState {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);

  const snake: Position[] = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  return {
    snake,
    food: spawnFood(cols, rows, snake),
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    isGameOver: false,
    isPaused: false,
  };
}

/**
 * Spawn food at a random position not occupied by the snake.
 */
export function spawnFood(
  cols: number,
  rows: number,
  snake: Position[]
): Position {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free: Position[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }

  if (free.length === 0) {
    return { x: 0, y: 0 };
  }

  return free[Math.floor(Math.random() * free.length)]!;
}

/**
 * Check if two positions are equal.
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Check if a position collides with the snake body.
 */
export function collidesWithSnake(
  position: Position,
  snake: Position[],
  skipHead = false
): boolean {
  const start = skipHead ? 1 : 0;
  for (let i = start; i < snake.length; i++) {
    if (positionsEqual(position, snake[i]!)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the opposite direction (used to prevent 180° turns).
 */
export function getOppositeDirection(dir: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return opposites[dir];
}

/**
 * Process a direction change, preventing 180° turns.
 */
export function processDirectionChange(
  current: Direction,
  next: Direction
): Direction {
  if (next === getOppositeDirection(current)) {
    return current;
  }
  return next;
}

/**
 * Advance the game by one tick.
 */
export function tick(state: SnakeState, cols: number, rows: number): SnakeState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = processDirectionChange(state.direction, state.nextDirection);
  const head = state.snake[0];

  if (!head) {
    return { ...state, isGameOver: true };
  }

  // Calculate new head position
  const newHead: Position = { ...head };
  switch (direction) {
    case 'up':
      newHead.y -= 1;
      break;
    case 'down':
      newHead.y += 1;
      break;
    case 'left':
      newHead.x -= 1;
      break;
    case 'right':
      newHead.x += 1;
      break;
  }

  // Check wall collision
  if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (collidesWithSnake(newHead, state.snake)) {
    return { ...state, isGameOver: true };
  }

  // Check food collision
  const ateFood = positionsEqual(newHead, state.food);
  const newSnake = [newHead, ...state.snake];

  if (!ateFood) {
    newSnake.pop();
  }

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? spawnFood(cols, rows, newSnake) : state.food,
    direction,
    nextDirection: direction,
    score: ateFood ? state.score + 10 : state.score,
  };
}
