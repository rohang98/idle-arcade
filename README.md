# idle-arcade

Terminal games that auto-launch when Claude Code is thinking.

```
+------------------------------------+
|                                    |
|         I D L E                    |
|       A R C A D E                  |
|                                    |
+------------------------------------+
|  > Snake                Best: 42  |
+------------------------------------+
|   Up/Down  Enter Play  Q Quit     |
+------------------------------------+
```

## What is this?

A retro arcade that pops up when Claude Code is thinking. Pick a game from the menu, play while you wait, and it vanishes when Claude needs your attention. Like the Chrome dinosaur game, but for your AI coding assistant.

## Requirements

- **Node.js** ≥ 20
- **Ghostty** terminal — games launch in a new Ghostty window

Other terminals won't see errors — the hooks silently no-op if Ghostty isn't detected.

## Install

```bash
npm install -g idle-arcade
```

Then configure the Claude Code hooks:

```bash
idle-arcade setup
```

Next time Claude Code starts thinking, the arcade menu will appear.

## Usage

```bash
# Open the arcade menu directly
idle-arcade arcade

# Play a specific game
idle-arcade play snake

# List available games
idle-arcade games

# View high scores
idle-arcade scores
```

## How It Works

```
Claude Code hooks → idle-arcade daemon → Ghostty window → arcade menu
```

1. Claude Code hooks fire `idle-arcade hook thinking` when Claude starts working
2. A background daemon receives the event via a unix socket
3. After 1.5s of continuous thinking, a Ghostty window opens with the arcade menu
4. Pick a game and play — scores are tracked locally
5. When Claude finishes, the window dismisses automatically
6. Game over? Choose **Play Again**, **Return to Menu**, or **Quit**

## The Arcade Experience

- **Menu screen** — browse available games with high scores displayed
- **Game shell** — wraps each game with score tracking and a game over modal
- **Game over modal** — shows your score, celebrates new high scores, offers Play Again / Return to Menu / Quit

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add games.

## License

MIT
