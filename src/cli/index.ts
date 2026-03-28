#!/usr/bin/env node

import { Command } from 'commander';
import { playCommand } from './commands/play.js';
import { watchCommand } from './commands/watch.js';
import { setupCommand } from './commands/setup.js';
import { scoresCommand } from './commands/scores.js';
import { listCommand } from './commands/list.js';
import { hookCommand } from './commands/hook.js';

// Import games to register them
import '../games/index.js';

const program = new Command();

program
  .name('idl')
  .description('Terminal games that auto-launch when Claude Code is idle')
  .version('0.1.0');

program
  .command('play <game>')
  .description('Play a game directly')
  .option('--popup', 'Running in popup mode (internal)', false)
  .action(async (game: string, options: { popup?: boolean }) => {
    await playCommand(game, options);
  });

program
  .command('watch')
  .description('Start daemon to watch Claude Code and launch games on idle')
  .option('-g, --game <game>', 'Game to play when idle', 'snake')
  .option('-t, --threshold <ms>', 'Idle threshold in milliseconds', '2000')
  .option('--demo', 'Run in demo mode with simulated idle cycles', false)
  .action(async (options: { game?: string; threshold?: string; demo?: boolean }) => {
    await watchCommand({
      game: options.game,
      threshold: options.threshold ? parseInt(options.threshold, 10) : undefined,
      demo: options.demo,
    });
  });

program
  .command('setup')
  .description('Auto-configure Claude Code hooks for idl')
  .action(async () => {
    await setupCommand();
  });

program
  .command('scores')
  .description('Show high scores and statistics')
  .action(async () => {
    await scoresCommand();
  });

program
  .command('games')
  .alias('list')
  .description('List available games')
  .action(async () => {
    await listCommand();
  });

program
  .command('hook <event>')
  .description('Handle a Claude Code hook event (auto-starts daemon)')
  .action(async (event: string) => {
    await hookCommand(event);
  });

program.parse();
