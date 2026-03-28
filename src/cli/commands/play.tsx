import { render } from 'ink';
import { getGame, getAllGames } from '../../games/index.js';
import type { GameDimensions } from '../../games/types.js';
import { recordGamePlayed } from '../../state/index.js';

/**
 * Get terminal dimensions, with sensible defaults.
 */
function getTerminalDimensions(): GameDimensions {
  return {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

/**
 * Play a game directly in the terminal.
 */
export async function playCommand(
  gameId: string,
  options: { popup?: boolean }
): Promise<void> {
  const game = getGame(gameId);

  if (!game) {
    const available = getAllGames()
      .map((g) => g.metadata.id)
      .join(', ');
    console.error(`Unknown game: ${gameId}`);
    console.error(`Available games: ${available || 'none'}`);
    process.exit(1);
  }

  const dimensions = getTerminalDimensions();
  const { minDimensions } = game.metadata;

  if (dimensions.cols < minDimensions.cols || dimensions.rows < minDimensions.rows) {
    console.error(
      `Terminal too small. Need at least ${minDimensions.cols}x${minDimensions.rows}, ` +
        `got ${dimensions.cols}x${dimensions.rows}`
    );
    process.exit(1);
  }

  const startTime = Date.now();
  let finalScore = 0;

  const handleExit = (): void => {
    const duration = Date.now() - startTime;
    recordGamePlayed(gameId, finalScore, duration);
  };

  const handleScoreChange = (score: number): void => {
    finalScore = score;
  };

  // Enter alternate screen buffer (unless in popup mode where tmux handles it)
  if (!options.popup) {
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[?25l'); // Hide cursor
  }

  const GameComponent = game.component;

  const element = (
    <GameComponent
      dimensions={dimensions}
      events={{
        onScoreChange: handleScoreChange,
        onGameOver: (score) => {
          finalScore = score;
        },
      }}
      onExit={handleExit}
    />
  );

  const instance = render(element, {
    exitOnCtrlC: true,
  });

  try {
    await instance.waitUntilExit();
  } finally {
    handleExit();

    if (!options.popup) {
      process.stdout.write('\x1b[?25h'); // Show cursor
      process.stdout.write('\x1b[?1049l'); // Exit alternate screen
    }
  }
}
