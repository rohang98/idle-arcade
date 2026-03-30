import { Box, useApp } from 'ink';
import { createElement, useCallback, useRef, useState } from 'react';
import type { GameDefinition, GameDimensions } from '../games/types.js';
import { getHighScore, recordGamePlayed } from '../state/storage.js';
import { GameOverModal } from './GameOverModal.js';

export interface GameShellProps {
  game: GameDefinition;
  dimensions: GameDimensions;
  onReturnToMenu: () => void;
  onExit: () => void;
}

export function GameShell({
  game,
  dimensions,
  onReturnToMenu,
  onExit,
}: GameShellProps): React.ReactElement {
  const { exit } = useApp();
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const startTimeRef = useRef(0);
  startTimeRef.current ||= Date.now();

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setIsGameOver(true);
    const duration = Date.now() - startTimeRef.current;
    const wasNewHigh = recordGamePlayed(game.metadata.id, finalScore, duration);
    setIsNewHighScore(wasNewHigh);
  }, [game.metadata.id]);

  const handlePlayAgain = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setIsNewHighScore(false);
    setGameKey((k) => k + 1);
    startTimeRef.current = Date.now();
  }, []);

  const handleQuit = useCallback(() => {
    onExit();
    exit();
  }, [onExit, exit]);

  const prevHighScore = getHighScore(game.metadata.id);

  return (
    <Box flexDirection="column">
      {createElement(game.component, {
        key: gameKey,
        dimensions,
        hideDefaultGameOver: true,
        events: {
          onScoreChange: handleScoreChange,
          onGameOver: handleGameOver,
        },
        onExit: handleQuit,
      })}

      {isGameOver ? (
        <GameOverModal
          score={score}
          highScore={prevHighScore?.score ?? null}
          isNewHighScore={isNewHighScore}
          width={dimensions.cols}
          onPlayAgain={handlePlayAgain}
          onReturnToMenu={onReturnToMenu}
          onQuit={handleQuit}
        />
      ) : null}
    </Box>
  );
}
