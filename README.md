# idle-arcade

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

When Claude Code is thinking, a game pops up in your terminal. When Claude finishes, the game vanishes.

## Install

```bash
npm install -g idle-arcade
```

Hooks are configured automatically. Next time Claude Code starts thinking, Snake will launch.

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
Claude Code hooks → idle-arcade daemon → tmux popup / inline terminal
```

1. Claude Code hooks call `idle-arcade hook <event>` on tool use and stop
2. The daemon starts automatically on the first hook event
3. After 2s of inactivity, a game launches
4. When Claude becomes active, the game dismisses instantly

## Watch Options

```bash
idle-arcade watch --game snake       # Choose game
idle-arcade watch --threshold 3000   # Custom idle timeout (ms)
idle-arcade watch --demo             # Simulate idle cycles
```

## Display Modes

Automatically detected:

1. **tmux popup** — floats over your pane (best experience)
2. **Inline** — alternate screen buffer fallback

## Manual Setup

If hooks weren't configured automatically:

```bash
idle-arcade setup
```

Or add to `~/.claude/settings.json` manually:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": {},
      "hooks": [{
        "type": "command",
        "command": "idle-arcade hook thinking",
        "timeout": 1000
      }]
    }],
    "Stop": [{
      "matcher": {},
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
# Remove the package
npm uninstall -g idle-arcade

# Remove hooks from Claude Code settings
# Edit ~/.claude/settings.json and delete the idle-arcade hook entries

# Optional: remove local data
rm -rf ~/.config/idle-arcade
```

## Games

- **Snake** — arrow keys/WASD/hjkl, P pause, Q quit

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add games.

## License

MIT
