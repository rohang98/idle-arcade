import { registerGame } from '../registry.js';
import { SnakeGame } from './SnakeGame.js';

/**
 * Snake game registration.
 *
 * Classic snake game where you eat food to grow longer.
 * Avoid hitting walls or yourself!
 */
registerGame({
  metadata: {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game - eat food, grow longer, avoid walls',
    author: 'idle-arcade contributors',
    version: '1.0.0',
    minDimensions: { cols: 30, rows: 15 },
    controls: '←↑↓→ or WASD to move, P to pause, Q to quit',
  },
  component: SnakeGame,
});

export { SnakeGame } from './SnakeGame.js';
