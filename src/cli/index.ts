#!/usr/bin/env node

import { Command } from 'commander';
import { playCommand } from './commands/play.js';
import { watchCommand } from './commands/watch.js';
import { setupCommand } from './commands/setup.js';
import { scoresCommand } from './commands/scores.js';
import { listCommand } from './commands/list.js';
import { hookCommand } from './commands/hook.js';

import '../games/index.js';

const program = new Command();

program
  .name('idle-arcade')
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
  .description('Watch Claude Code and auto-launch games on idle')
  .option('-g, --game <game>', 'Game to play when idle', 'snake')
  .option('-t, --threshold <ms>', 'Idle threshold in ms (default: 2000)')
  .option('--demo', 'Simulate idle cycles for testing', false)
  .action(async (options: { game?: string; threshold?: string; demo?: boolean }) => {
    await watchCommand({
      game: options.game,
      threshold: options.threshold ? parseInt(options.threshold, 10) : undefined,
      demo: options.demo,
    });
  });

program
  .command('setup')
  .description('Configure Claude Code hooks')
  .option('-q, --quiet', 'Suppress output', false)
  .action((options: { quiet?: boolean }) => {
    setupCommand(options);
  });

program
  .command('scores')
  .description('Show high scores and stats')
  .action(() => {
    scoresCommand();
  });

program
  .command('games')
  .alias('list')
  .description('List available games')
  .action(() => {
    listCommand();
  });

program
  .command('hook <event>', { hidden: true })
  .description('Handle hook event (internal)')
  .action(async (event: string) => {
    await hookCommand(event);
  });

program.parse();
