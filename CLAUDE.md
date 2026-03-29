# idle-arcade

Terminal games that auto-launch when Claude Code is idle.

## Architecture

```
src/
├── cli/                    # CLI entry point and commands
│   ├── index.ts           # Commander setup, main entry
│   └── commands/
│       ├── play.tsx       # `idle-arcade play <game>` - direct play
│       ├── watch.ts       # `idle-arcade watch` - daemon mode
│       ├── setup.ts       # `idle-arcade setup` - configure hooks
│       ├── hook.ts        # `idle-arcade hook <event>` - hook handler (auto-starts daemon)
│       ├── arcade.tsx     # `idle-arcade arcade` - retro arcade menu
│       ├── list.ts        # `idle-arcade games` - list games
│       └── scores.ts      # `idle-arcade scores` - high scores
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
├── ui/                     # Shared UI components
│   ├── ArcadeScreen.tsx   # Top-level screen router (menu ↔ game)
│   ├── ArcadeMenu.tsx     # Retro arcade menu with game selection
│   ├── GameShell.tsx      # Game wrapper with game-over modal
│   ├── GameOverModal.tsx  # Centered game over overlay
│   └── ascii-art.ts       # ASCII art title, helpers
│
├── display/                # Display strategies
│   ├── types.ts           # DisplayStrategy, DisplayHandle interfaces
│   ├── index.ts           # DisplayManager (auto-detects best strategy)
│   ├── ghostty.ts         # Ghostty window display
│   └── inline.ts          # Inline terminal (alternate screen buffer)
│
├── detector/               # Idle detection
│   ├── types.ts           # ClaudeState, HookEvent, DetectorConfig
│   ├── index.ts           # IdleDetector state machine
│   └── socket-server.ts   # Unix socket server for hook events
│
├── state/                  # Persistence
│   ├── types.ts           # HighScoreEntry, Stats
│   ├── storage.ts         # Read/write ~/.config/idle-arcade/*.json
│   └── index.ts           # Re-exports
│
├── config.ts              # Shared constants (socket path)
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
  launch(component: ReactElement, options?: DisplayOptions): Promise<DisplayHandle>;
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
npm test           # Run tests (vitest)
npm run lint       # ESLint (warnings for console.log are OK)
npm run typecheck  # Type checking only
npm run dev        # tsx watch mode
```

## Hook Integration

Claude Code hooks call `idle-arcade hook <event>` which auto-starts the daemon if needed.
Hooks only activate when `TERM_PROGRAM=ghostty` — silently no-op in other terminals and the desktop app.

`idle-arcade setup` auto-configures `~/.claude/settings.json`.

## Design Principles

1. **Extensible** - Easy to add games via registry pattern
2. **Short sessions** - Games designed for 30s-2min bursts
3. **Non-intrusive** - Instant dismiss when Claude needs attention
4. **Offline-first** - No network required, local state only
