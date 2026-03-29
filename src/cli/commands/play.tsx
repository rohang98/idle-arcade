import { render } from 'ink';
import { getGame, getAllGames } from '../../games/index.js';
import { recordGamePlayed } from '../../state/index.js';

export async function playCommand(
  gameId: string,
  _options?: { popup?: boolean }
): Promise<void> {
  const game = getGame(gameId);

  if (!game) {
    const available = getAllGames()
      .map((g) => g.metadata.id)
      .join(', ');
    console.error(`Unknown game: ${gameId}. Available: ${available || 'none'}`);
    process.exit(1);
  }

  const dimensions = {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };

  const { minDimensions } = game.metadata;
  if (dimensions.cols < minDimensions.cols || dimensions.rows < minDimensions.rows) {
    console.error(
      `Terminal too small (${dimensions.cols}x${dimensions.rows}). ` +
        `Need at least ${minDimensions.cols}x${minDimensions.rows}.`
    );
    process.exit(1);
  }

  const startTime = Date.now();
  let finalScore = 0;

  // Always use alt screen for a clean display
  process.stdout.write('\x1b[?1049h\x1b[?25l');

  const GameComponent = game.component;
  const instance = render(
    <GameComponent
      dimensions={dimensions}
      events={{
        onScoreChange: (score) => { finalScore = score; },
        onGameOver: (score) => { finalScore = score; },
      }}
      onExit={() => {
        recordGamePlayed(gameId, finalScore, Date.now() - startTime);
      }}
    />,
    { exitOnCtrlC: true }
  );

  try {
    await instance.waitUntilExit();
  } finally {
    recordGamePlayed(gameId, finalScore, Date.now() - startTime);
    process.stdout.write('\x1b[?25h\x1b[?1049l');
  }
}
