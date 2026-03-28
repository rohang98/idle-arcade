import { createElement } from 'react';
import { IdleDetector } from '../../detector/index.js';
import { SocketServer } from '../../detector/socket-server.js';
import { displayManager } from '../../display/index.js';
import { getGame, getAllGames } from '../../games/index.js';
import { incrementStat } from '../../state/index.js';
import chalk from 'chalk';

export interface WatchOptions {
  game?: string | undefined;
  demo?: boolean | undefined;
  threshold?: number | undefined;
}

/**
 * Watch for Claude Code idle state and launch games.
 */
export async function watchCommand(options: WatchOptions): Promise<void> {
  const gameId = options.game ?? 'snake';
  const game = getGame(gameId);

  if (!game) {
    const available = getAllGames()
      .map((g) => g.metadata.id)
      .join(', ');
    console.error(`Unknown game: ${gameId}`);
    console.error(`Available games: ${available || 'none'}`);
    process.exit(1);
  }

  const detector = new IdleDetector({
    idleThresholdMs: options.threshold ?? 2000,
  });

  const socketServer = new SocketServer(detector);

  // Track session
  incrementStat('sessionsWatched');

  console.log(chalk.cyan('idl') + ' - Terminal games for Claude Code idle time\n');

  try {
    await socketServer.start();
    console.log(chalk.green('✓') + ` Listening on ${socketServer.getSocketPath()}`);
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to start socket server: ${String(err)}`);
    process.exit(1);
  }

  console.log(chalk.green('✓') + ` Game ready: ${game.metadata.name}`);
  console.log();

  // Show hook setup instructions
  console.log(chalk.yellow('To enable auto-detection, add hooks to Claude Code:'));
  console.log();
  console.log(chalk.dim('  Run: ') + chalk.white('idl setup'));
  console.log();
  console.log(chalk.dim('Or manually add to ~/.claude/settings.json:'));
  console.log();
  printHookConfig(socketServer.getSocketPath());
  console.log();

  console.log(chalk.dim('Waiting for Claude Code events...'));
  console.log(chalk.dim('Press Ctrl+C to exit\n'));

  // Demo mode: simulate idle/active cycles
  if (options.demo) {
    console.log(chalk.yellow('Demo mode: simulating idle cycles\n'));
    runDemoMode(detector);
  }

  // Handle idle state
  detector.on('idle', () => {
    console.log(chalk.green('→ Idle detected, launching game...'));
    launchGame(game, detector);
  });

  // Handle active state
  detector.on('active', () => {
    console.log(chalk.blue('→ Active, dismissing game...'));
    void displayManager.dismiss();
  });

  detector.on('thinking', () => {
    console.log(chalk.yellow('→ Claude thinking...'));
  });

  // Graceful shutdown
  const cleanup = async (): Promise<void> => {
    console.log(chalk.dim('\nShutting down...'));
    await displayManager.dismiss();
    await socketServer.stop();
    detector.destroy();
    process.exit(0);
  };

  process.on('SIGINT', () => void cleanup());
  process.on('SIGTERM', () => void cleanup());

  // Keep process alive
  await new Promise(() => {
    // Never resolves - keeps the process running
  });
}

async function launchGame(
  game: ReturnType<typeof getGame>,
  detector: IdleDetector
): Promise<void> {
  if (!game) return;

  try {
    const dimensions = {
      cols: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
    };

    const element = createElement(game.component, {
      dimensions,
      onExit: () => {
        displayManager.dismiss().catch(() => {});
        detector.markActive();
      },
    });

    await displayManager.launch(element);
  } catch (err) {
    console.error(chalk.red('Failed to launch game:'), err);
  }
}

function printHookConfig(socketPath: string): void {
  const config = {
    hooks: {
      PreToolUse: [
        {
          matcher: {},
          hooks: [
            {
              type: 'command',
              command: `echo '{"event":"thinking"}' | nc -U ${socketPath}`,
              timeout: 1000,
            },
          ],
        },
      ],
      Stop: [
        {
          matcher: {},
          hooks: [
            {
              type: 'command',
              command: `echo '{"event":"done"}' | nc -U ${socketPath}`,
              timeout: 1000,
            },
          ],
        },
      ],
    },
  };

  console.log(chalk.dim(JSON.stringify(config, null, 2)));
}

function runDemoMode(detector: IdleDetector): void {
  let isIdle = false;

  setInterval(() => {
    if (isIdle) {
      console.log(chalk.dim('[demo] Simulating activity...'));
      detector.onEvent({ event: 'thinking' });
      setTimeout(() => {
        detector.onEvent({ event: 'done' });
      }, 1000);
    } else {
      // Let it go idle naturally via debounce
    }
    isIdle = !isIdle;
  }, 8000);

  // Start with idle after initial delay
  setTimeout(() => {
    detector.onEvent({ event: 'done' });
  }, 1000);
}
