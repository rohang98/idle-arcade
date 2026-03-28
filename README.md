# idl

Terminal games that auto-launch when Claude Code is idle.

```
╔══════════════════════════════════════╗
║                              Score: 5║
║                                      ║
║          ○○○●                        ║
║                         ◆            ║
║                                      ║
╚══════════════════════════════════════╝
```

## What is this?

`idl` is a companion tool for [Claude Code](https://claude.ai/claude-code). When Claude is thinking, a game automatically pops up in your terminal. When Claude finishes, the game vanishes.

**The killer demo:** Claude starts thinking → tmux popup with Snake → Claude finishes → game disappears.

## Requirements

- Node.js 20+
- macOS or Linux
- tmux (optional, for popup display)

## Installation

```bash
npm install -g idl
```

## Quick Start

### Play games directly

```bash
idl play snake
```

### Auto-launch on Claude Code idle

```bash
# One-time setup: configure Claude Code hooks
idl setup

# Start watching for idle
idl watch
```

## How It Works

```
┌─────────────────┐     Unix Socket      ┌─────────────────┐
│  Claude Code    │ ──────────────────→  │   idl daemon    │
│  (hooks fire)   │   JSON events        │  (state machine)│
└─────────────────┘                      └────────┬────────┘
                                                  │
                                         ┌────────▼────────┐
                                         │  tmux popup     │
                                         │  (Snake game)   │
                                         └─────────────────┘
```

1. Claude Code hooks notify `idl` when Claude starts/stops thinking
2. After 2 seconds of inactivity, `idl` launches a game
3. When Claude becomes active, the game instantly dismisses

## Commands

| Command | Description |
|---------|-------------|
| `idl play <game>` | Play a game directly |
| `idl watch` | Watch Claude Code and auto-launch games |
| `idl setup` | Auto-configure Claude Code hooks |
| `idl games` | List available games |
| `idl scores` | Show high scores and stats |

## Watch Options

```bash
# Use a specific game
idl watch --game snake

# Custom idle threshold (default: 2000ms)
idl watch --threshold 3000

# Demo mode (simulates idle cycles)
idl watch --demo
```

## Available Games

- **Snake** - Classic snake game. Eat food, grow longer, avoid walls.

More games coming soon! [Contribute a game →](CONTRIBUTING.md)

## Display Modes

`idl` automatically detects the best display mode:

1. **tmux popup** - Floats over your tmux pane (recommended)
2. **Inline** - Uses alternate screen buffer

For the best experience, use tmux.

## Manual Hook Configuration

If you prefer manual setup, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": {},
      "hooks": [{
        "type": "command",
        "command": "echo '{\"event\":\"thinking\"}' | nc -U /tmp/idl.sock",
        "timeout": 1000
      }]
    }],
    "Stop": [{
      "matcher": {},
      "hooks": [{
        "type": "command",
        "command": "echo '{\"event\":\"done\"}' | nc -U /tmp/idl.sock",
        "timeout": 1000
      }]
    }]
  }
}
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to add new games
- Code style guidelines
- Development setup

## License

MIT
