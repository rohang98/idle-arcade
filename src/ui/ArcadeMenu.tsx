import { Box, Text, useApp, useInput } from 'ink';
import { useState } from 'react';
import type { GameDefinition, GameDimensions } from '../games/types.js';
import { getHighScore } from '../state/storage.js';
import { ARCADE_TITLE, centerText } from './ascii-art.js';

export interface ArcadeMenuProps {
  games: GameDefinition[];
  dimensions: GameDimensions;
  onSelect: (gameId: string) => void;
  onExit: () => void;
}

const BORDER = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  midLeft: '╠',
  midRight: '╣',
} as const;

export function ArcadeMenu({
  games,
  dimensions,
  onSelect,
  onExit,
}: ArcadeMenuProps): React.ReactElement {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const innerWidth = Math.min(dimensions.cols - 2, 56);
  const border = (content: string): string =>
    BORDER.vertical + centerText(content, innerWidth) + BORDER.vertical;
  const topBorder =
    BORDER.topLeft + BORDER.horizontal.repeat(innerWidth) + BORDER.topRight;
  const bottomBorder =
    BORDER.bottomLeft + BORDER.horizontal.repeat(innerWidth) + BORDER.bottomRight;
  const midBorder =
    BORDER.midLeft + BORDER.horizontal.repeat(innerWidth) + BORDER.midRight;

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      onExit();
      exit();
      return;
    }

    if (key.upArrow || input === 'k' || input === 'w') {
      setSelectedIndex((i) => (i > 0 ? i - 1 : games.length - 1));
    } else if (key.downArrow || input === 'j' || input === 's') {
      setSelectedIndex((i) => (i < games.length - 1 ? i + 1 : 0));
    } else if (key.return) {
      const game = games[selectedIndex];
      if (game) {
        onSelect(game.metadata.id);
      }
    }
  });

  return (
    <Box flexDirection="column" alignItems="center">
      {/* Title */}
      <Text color="cyan">{topBorder}</Text>
      <Text color="cyan">{border('')}</Text>
      {ARCADE_TITLE.map((line, i) => (
        <Box key={i}>
          <Text color="cyan">{BORDER.vertical}</Text>
          <Text color="yellow" bold>
            {centerText(line, innerWidth)}
          </Text>
          <Text color="cyan">{BORDER.vertical}</Text>
        </Box>
      ))}
      <Text color="cyan">{border('')}</Text>
      <Text color="cyan">{midBorder}</Text>

      {/* Game list */}
      <Text color="cyan">{border('')}</Text>
      {games.map((game, i) => {
        const isSelected = i === selectedIndex;
        const cursor = isSelected ? '▸' : ' ';
        const highScore = getHighScore(game.metadata.id);
        const scoreText = highScore ? `${highScore.score}` : '--';
        const nameCol = `${cursor} ${game.metadata.name}`;
        const scoreCol = `Best: ${scoreText}`;
        const padding = Math.max(1, innerWidth - nameCol.length - scoreCol.length);
        const line = nameCol + ' '.repeat(padding) + scoreCol;

        return (
          <Box key={game.metadata.id}>
            <Text color="cyan">{BORDER.vertical}</Text>
            <Text color={isSelected ? 'yellow' : 'white'} bold={isSelected}>
              {' '}{line}{' '.repeat(Math.max(0, innerWidth - line.length - 1))}
            </Text>
            <Text color="cyan">{BORDER.vertical}</Text>
          </Box>
        );
      })}
      <Text color="cyan">{border('')}</Text>
      <Text color="cyan">{midBorder}</Text>

      {/* Controls */}
      <Text color="cyan">{border('')}</Text>
      <Box>
        <Text color="cyan">{BORDER.vertical}</Text>
        <Text dimColor>
          {centerText('↑↓ Select   Enter Play   Q Quit', innerWidth)}
        </Text>
        <Text color="cyan">{BORDER.vertical}</Text>
      </Box>
      <Text color="cyan">{border('')}</Text>
      <Text color="cyan">{bottomBorder}</Text>
    </Box>
  );
}
