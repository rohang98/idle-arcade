# idle-arcade

Terminal games that auto-launch when Claude Code is thinking.

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

When Claude Code is thinking, a game pops up in your terminal. When Claude finishes, the game vanishes. Kill time while you wait.

## Requirements

- **Node.js** ≥ 20
- **Ghostty** — games launch in a new Ghostty window. If Ghostty isn't available, the game renders inline (alternate screen buffer).

## Install

```bash
npm install -g idle-arcade
```

Then configure the Claude Code hooks:

```bash
idle-arcade setup
```

Next time Claude Code starts thinking, Snake will launch.

## Usage

```bash
# Play directly
idle-arcade play snake

# List games
idle-arcade games

# High scores
idle-arcade scores
```

## How It Works

```
Claude Code hooks → idle-arcade daemon → Ghostty window / inline
```

1. Claude Code hooks call `idle-arcade hook <event>` on tool use and stop events
2. The daemon starts automatically on the first hook event
3. After 1.5s of Claude thinking, a game launches in a new Ghostty window
4. When Claude finishes, the game dismisses automatically

## Display Modes

Automatically detected:

1. **Ghostty window** (recommended) — opens a new terminal window, closes on dismiss
2. **Inline** — alternate screen buffer fallback when Ghostty isn't available

## Watch Options

```bash
idle-arcade watch --game snake       # Choose game
idle-arcade watch --threshold 3000   # Custom idle timeout (ms)
idle-arcade watch --demo             # Simulate thinking cycles
```

## Manual Setup

If `idle-arcade setup` doesn't work, add to `~/.claude/settings.json` manually:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "idle-arcade hook thinking",
        "timeout": 1000
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "idle-arcade hook done",
        "timeout": 1000
      }]
    }]
  }
}
```

## Uninstall

```bash
# Remove hooks from Claude Code settings
idle-arcade uninstall

# Remove the package
npm uninstall -g idle-arcade

# Optional: remove local data
rm -rf ~/.config/idle-arcade
```

## Games

- **Snake** — arrow keys/WASD/hjkl, P pause, Q quit

## Upcoming

- More games (Tetris, Breakout, 2048)
- More terminal support (iTerm2, WezTerm, Kitty, Terminal.app)
- Game selection rotation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add games.

## License

MIT
