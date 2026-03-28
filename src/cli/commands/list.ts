import chalk from 'chalk';
import { getAllGames } from '../../games/index.js';
import { getHighScore } from '../../state/index.js';

/**
 * List all available games.
 */
export function listCommand(): void {
  console.log(chalk.cyan('idle-arcade games') + ' - Available games\n');

  const games = getAllGames();

  if (games.length === 0) {
    console.log(chalk.dim('No games registered.'));
    return;
  }

  for (const game of games) {
    const { metadata } = game;
    const highScore = getHighScore(metadata.id);

    console.log(chalk.bold.white(metadata.name) + chalk.dim(` (${metadata.id})`));
    console.log(chalk.dim(`  ${metadata.description}`));
    console.log(
      chalk.dim(`  Controls: `) + metadata.controls
    );
    console.log(
      chalk.dim(`  Min size: `) +
        `${metadata.minDimensions.cols}x${metadata.minDimensions.rows}`
    );

    if (highScore) {
      console.log(
        chalk.dim(`  High score: `) + chalk.yellow(highScore.score.toString())
      );
    }

    console.log();
  }

  console.log(chalk.dim('Play a game: ') + chalk.white('idle-arcade play <game>'));
}
