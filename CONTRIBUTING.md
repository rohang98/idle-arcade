# Contributing to idle-arcade

Thanks for your interest in contributing to idle-arcade! This guide will help you get started.

## Adding a New Game

Adding a game is the most common contribution. Here's how:

### 1. Create your game directory

```
src/games/your-game/
├── index.ts          # Registers the game
├── YourGame.tsx      # Main React component
├── logic.ts          # Game logic (pure functions)
└── types.ts          # TypeScript types
```

### 2. Implement the GameProps interface

Your game component must accept `GameProps`:

```typescript
import type { GameProps } from '../types.js';

export function YourGame({ dimensions, events, onExit }: GameProps): React.ReactElement {
  // dimensions.cols and dimensions.rows give you the available space
  // events.onScoreChange?.(score) to report score changes
  // events.onGameOver?.(finalScore) when game ends
  // onExit?.() when user wants to quit
}
```

### 3. Register your game

In `src/games/your-game/index.ts`:

```typescript
import { registerGame } from '../registry.js';
import { YourGame } from './YourGame.js';

registerGame({
  metadata: {
    id: 'your-game',           // lowercase, no spaces
    name: 'Your Game',         // display name
    description: 'A fun game', // short description
    author: 'Your Name',
    version: '1.0.0',
    minDimensions: { cols: 40, rows: 20 },
    controls: '←↑↓→ to move, Q to quit',
  },
  component: YourGame,
});
```

### 4. Add to game index

In `src/games/index.ts`, add:

```typescript
import './your-game/index.js';
```

### 5. Test your game

```bash
npm run build
./dist/cli/index.js play your-game
```

## Code Style

- Use TypeScript strict mode
- Separate game logic from rendering (pure functions in `logic.ts`)
- Use Ink components for rendering
- Support both arrow keys and WASD/vim keys
- Handle terminal resize gracefully
- Clean up timers/intervals on unmount

## Game Design Guidelines

- Games should be playable in short bursts (30 seconds - 2 minutes)
- Support pause (user might need to return to Claude)
- Show clear controls on screen
- Keep minimum dimensions reasonable (fit in a popup)
- Use Unicode box-drawing characters for borders
- Use colors sparingly but effectively

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b add-tetris-game`)
3. Make your changes
4. Run tests and linting (`npm run lint && npm run typecheck`)
5. Commit with a clear message
6. Push and open a PR

## Development Setup

```bash
git clone https://github.com/yourusername/idle-arcade.git
cd idle-arcade
npm install
npm run build
```

For development with auto-reload:

```bash
npm run dev -- play snake
```

## Questions?

Open an issue on GitHub!
