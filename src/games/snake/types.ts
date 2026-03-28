/**
 * A position on the game grid.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Direction the snake is moving.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Internal state of the snake game.
 */
export interface SnakeState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
}
