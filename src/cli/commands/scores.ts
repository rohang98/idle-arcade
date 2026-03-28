import chalk from 'chalk';
import { getScores, getStats } from '../../state/index.js';
import { getAllGames } from '../../games/index.js';

export function scoresCommand(): void {
  const scores = getScores();
  const stats = getStats();
  const games = getAllGames();

  console.log(chalk.bold('High Scores'));

  let hasScores = false;
  for (const game of games) {
    const score = scores[game.metadata.id];
    if (score) {
      hasScores = true;
      const date = new Date(score.date).toLocaleDateString();
      console.log(
        `  ${game.metadata.name.padEnd(15)} ` +
          `${chalk.bold(score.score.toString().padStart(6))} ` +
          chalk.dim(`(${date})`)
      );
    }
  }

  if (!hasScores) {
    console.log(chalk.dim('  No scores yet.'));
  }

  console.log();
  console.log(chalk.bold('Stats'));
  console.log(`  Games played:    ${stats.gamesPlayed}`);
  console.log(`  Watch sessions:  ${stats.sessionsWatched}`);

  if (stats.totalIdleTime > 0) {
    const minutes = Math.round(stats.totalIdleTime / 60000);
    console.log(`  Idle time:       ${minutes} min`);
  }

  if (stats.firstUsed) {
    console.log(`  Since:           ${chalk.dim(new Date(stats.firstUsed).toLocaleDateString())}`);
  }
}
