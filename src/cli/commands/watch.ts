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

export async function watchCommand(options: WatchOptions): Promise<void> {
  const gameId = options.game ?? 'snake';
  const game = getGame(gameId);

  if (!game) {
    const available = getAllGames()
      .map((g) => g.metadata.id)
      .join(', ');
    console.error(`Unknown game: ${gameId}`);
    console.error(`Available: ${available || 'none'}`);
    process.exit(1);
  }

  const detector = new IdleDetector({
    idleThresholdMs: options.threshold ?? 2000,
  });

  const socketServer = new SocketServer(detector);
  incrementStat('sessionsWatched');

  try {
    await socketServer.start();
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to start: ${String(err)}`);
    process.exit(1);
  }

  console.log(chalk.green('✓') + ` Watching for idle (${game.metadata.name})`);
  console.log(chalk.dim(`  socket: ${socketServer.getSocketPath()}`));

  if (options.demo) {
    console.log(chalk.dim('  mode: demo'));
    runDemoMode(detector);
  }

  // Launch game when Claude is thinking (user is waiting).
  // Close game when Claude is done (user needs to interact).
  let launchTimer: NodeJS.Timeout | null = null;
  let launching = false;

  detector.on('thinking', () => {
    // Small delay to avoid flashing on very quick tool uses
    if (launchTimer || launching || displayManager.isActive()) return;
    launchTimer = setTimeout(() => {
      launchTimer = null;
      if (!launching && !displayManager.isActive()) {
        void launchGame();
      }
    }, 1500);
  });

  detector.on('active', () => {
    if (launchTimer) {
      clearTimeout(launchTimer);
      launchTimer = null;
    }
    void displayManager.dismiss();
  });

  const cleanup = async (): Promise<void> => {
    await displayManager.dismiss();
    await socketServer.stop();
    detector.destroy();
    process.exit(0);
  };

  process.on('SIGINT', () => void cleanup());
  process.on('SIGTERM', () => void cleanup());

  async function launchGame(): Promise<void> {
    if (!game) return;
    launching = true;
    try {
      const dimensions = {
        cols: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
      };

      const element = createElement(game.component, {
        dimensions,
        onExit: () => {
          displayManager.dismiss().catch(() => {});
          detector.markActiveNoDebounce();
        },
      });

      await displayManager.launch(element, {
        gameId: game.metadata.id,
      });
    } catch (err) {
      console.error(chalk.red('✗') + ` Launch failed: ${String(err)}`);
    } finally {
      launching = false;
    }
  }

  await new Promise(() => {});
}

function runDemoMode(detector: IdleDetector): void {
  // Simulate: thinking for 10s, then done for 5s, repeat
  setTimeout(() => {
    detector.onEvent({ event: 'thinking' });
  }, 1000);

  setInterval(() => {
    detector.onEvent({ event: 'thinking' });
    setTimeout(() => {
      detector.onEvent({ event: 'done' });
    }, 10000);
  }, 15000);
}
