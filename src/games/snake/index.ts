import { registerGame } from '../registry.js';
import { SnakeGame } from './SnakeGame.js';

registerGame({
  metadata: {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game - eat food, grow longer, avoid walls',
    author: 'idle-arcade contributors',
    version: '1.0.0',
    minDimensions: { cols: 30, rows: 15 },
    controls: 'Arrow keys/WASD/hjkl, P pause, Q quit',
  },
  component: SnakeGame,
});

export { SnakeGame } from './SnakeGame.js';
