import chalk from 'chalk';
import { getAllGames } from '../../games/index.js';
import { getHighScore } from '../../state/index.js';

export function listCommand(): void {
  const games = getAllGames();

  if (games.length === 0) {
    console.log(chalk.dim('No games installed.'));
    return;
  }

  for (const game of games) {
    const { metadata } = game;
    const highScore = getHighScore(metadata.id);

    console.log(chalk.bold(metadata.name) + chalk.dim(` (${metadata.id})`));
    console.log(chalk.dim(`  ${metadata.description}`));
    console.log(chalk.dim(`  Controls: `) + metadata.controls);

    if (highScore) {
      console.log(chalk.dim(`  High score: `) + chalk.bold(highScore.score.toString()));
    }

    console.log();
  }
}
