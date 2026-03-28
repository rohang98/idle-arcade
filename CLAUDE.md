# idl - Project Context for Claude Code

Terminal games that auto-launch when Claude Code is idle.

## Architecture

```
src/
├── cli/                    # CLI entry point and commands
│   ├── index.ts           # Commander setup, main entry
│   └── commands/
│       ├── play.tsx       # `idl play <game>` - direct play
│       ├── watch.ts       # `idl watch` - daemon mode
│       ├── setup.ts       # `idl setup` - configure hooks
│       ├── list.ts        # `idl games` - list games
│       └── scores.ts      # `idl scores` - high scores
│
├── games/                  # Game implementations
│   ├── types.ts           # GameProps, GameDefinition, GameMetadata
│   ├── registry.ts        # Game registry (registerGame, getGame)
│   ├── index.ts           # Re-exports + imports all games
│   └── snake/             # Snake game (reference implementation)
│       ├── index.ts       # Registers with registry
│       ├── SnakeGame.tsx  # React/Ink component
│       ├── logic.ts       # Pure game logic functions
│       └── types.ts       # Snake-specific types
│
├── display/                # Display strategies
│   ├── types.ts           # DisplayStrategy, DisplayHandle interfaces
│   ├── index.ts           # DisplayManager (auto-detects best strategy)
│   ├── tmux.ts            # tmux popup display
│   └── inline.ts          # Inline terminal (alternate screen buffer)
│
├── detector/               # Idle detection
│   ├── types.ts           # ClaudeState, HookEvent, DetectorConfig
│   ├── index.ts           # IdleDetector state machine
│   └── socket-server.ts   # Unix socket server for hook events
│
├── state/                  # Persistence
│   ├── types.ts           # HighScoreEntry, Stats
│   ├── storage.ts         # Read/write ~/.config/idl/*.json
│   └── index.ts           # Re-exports
│
└── index.ts               # Library entry point
```

## Key Interfaces

### Adding a New Game

Games implement `GameProps` and register via `registerGame()`:

```typescript
interface GameProps {
  dimensions: { cols: number; rows: number };
  events?: {
    onScoreChange?: (score: number) => void;
    onGameOver?: (finalScore: number) => void;
  };
  onExit?: () => void;
}
```

See `src/games/snake/` as the reference implementation.

### Display Strategies

Implement `DisplayStrategy` to add new display modes:

```typescript
interface DisplayStrategy {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  launch(component: ReactElement): Promise<DisplayHandle>;
}
```

## Tech Stack

- **Ink** - React for CLIs (rendering)
- **Commander** - CLI argument parsing
- **Chalk** - Terminal colors
- **TypeScript** - Strict mode, ESM

## Commands

```bash
npm run build      # Compile TypeScript
npm run lint       # ESLint (warnings for console.log are OK)
npm run typecheck  # Type checking only
npm run dev        # tsx watch mode
```

## Current Status

### Working
- Snake game renders and plays correctly
- CLI commands: play, watch, setup, games, scores
- High score persistence
- Inline display (alternate screen buffer)
- Idle detector state machine
- Unix socket server for hook events

### Needs Work
- **Hero GIF** for README showing game launch/dismiss cycle
- tmux popup: launches but doesn't pass component properly (uses hardcoded `play snake`)
- Integration testing with real Claude Code session
- More games (Tetris, Pong, etc.)

## Hook Integration

Claude Code hooks send JSON to Unix socket at `/tmp/idl.sock`:

```json
{"event": "thinking"}  // PreToolUse
{"event": "done"}      // Stop
```

`idl setup` auto-configures `~/.claude/settings.json`.

## Design Principles

1. **Extensible** - Easy to add games via registry pattern
2. **Short sessions** - Games designed for 30s-2min bursts
3. **Non-intrusive** - Instant dismiss when Claude needs attention
4. **Offline-first** - No network required, local state only
