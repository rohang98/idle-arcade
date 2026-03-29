import { useState } from 'react';
import { getAllGames, getGame } from '../games/index.js';
import type { GameDimensions } from '../games/types.js';
import { ArcadeMenu } from './ArcadeMenu.js';
import { GameShell } from './GameShell.js';

export interface ArcadeScreenProps {
  dimensions: GameDimensions;
  onExit: () => void;
}

type Screen = { type: 'menu' } | { type: 'playing'; gameId: string };

export function ArcadeScreen({
  dimensions,
  onExit,
}: ArcadeScreenProps): React.ReactElement {
  const [screen, setScreen] = useState<Screen>({ type: 'menu' });
  const games = getAllGames();

  if (screen.type === 'playing') {
    const game = getGame(screen.gameId);
    if (!game) {
      setScreen({ type: 'menu' });
      return <ArcadeMenu games={games} dimensions={dimensions} onSelect={handleSelect} onExit={onExit} />;
    }
    return (
      <GameShell
        game={game}
        dimensions={dimensions}
        onReturnToMenu={() => setScreen({ type: 'menu' })}
        onExit={onExit}
      />
    );
  }

  function handleSelect(gameId: string): void {
    setScreen({ type: 'playing', gameId });
  }

  return (
    <ArcadeMenu
      games={games}
      dimensions={dimensions}
      onSelect={handleSelect}
      onExit={onExit}
    />
  );
}
