import chalk from 'chalk';
import { getScores, getStats } from '../../state/index.js';
import { getAllGames } from '../../games/index.js';

/**
 * Display high scores and stats.
 */
export function scoresCommand(): void {
  console.log(chalk.cyan('idl scores') + ' - Your gaming stats\n');

  const scores = getScores();
  const stats = getStats();
  const games = getAllGames();

  // Display high scores
  console.log(chalk.bold('High Scores:'));
  console.log(chalk.dim('─'.repeat(40)));

  let hasScores = false;
  for (const game of games) {
    const score = scores[game.metadata.id];
    if (score) {
      hasScores = true;
      const date = new Date(score.date).toLocaleDateString();
      console.log(
        `  ${chalk.white(game.metadata.name.padEnd(15))} ` +
          `${chalk.yellow(score.score.toString().padStart(6))} ` +
          chalk.dim(`(${date})`)
      );
    }
  }

  if (!hasScores) {
    console.log(chalk.dim('  No high scores yet. Play some games!'));
  }

  console.log();

  // Display stats
  console.log(chalk.bold('Statistics:'));
  console.log(chalk.dim('─'.repeat(40)));
  console.log(`  Games played:     ${chalk.white(stats.gamesPlayed.toString())}`);
  console.log(`  Watch sessions:   ${chalk.white(stats.sessionsWatched.toString())}`);

  if (stats.totalIdleTime > 0) {
    const minutes = Math.round(stats.totalIdleTime / 60000);
    console.log(`  Total idle time:  ${chalk.white(minutes + ' min')}`);
  }

  if (stats.firstUsed) {
    const firstUsed = new Date(stats.firstUsed).toLocaleDateString();
    console.log(`  First used:       ${chalk.dim(firstUsed)}`);
  }

  console.log();
}
