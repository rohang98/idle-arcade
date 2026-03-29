import { Box, Text, useApp, useInput } from 'ink';
import { useState } from 'react';
import type { GameDefinition, GameDimensions } from '../games/types.js';
import { getHighScore } from '../state/storage.js';
import { ARCADE_TITLE, padRight } from './ascii-art.js';

export interface ArcadeMenuProps {
  games: GameDefinition[];
  dimensions: GameDimensions;
  onSelect: (gameId: string) => void;
  onExit: () => void;
}

const MENU_WIDTH = 56;

export function ArcadeMenu({
  games,
  dimensions,
  onSelect,
  onExit,
}: ArcadeMenuProps): React.ReactElement {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const boxWidth = Math.min(dimensions.cols - 4, MENU_WIDTH);

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
    <Box
      width={dimensions.cols}
      height={dimensions.rows}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      {/* Title section */}
      <Box
        flexDirection="column"
        alignItems="center"
        borderStyle="round"
        borderColor="cyan"
        width={boxWidth}
        paddingX={1}
        paddingY={1}
      >
        {ARCADE_TITLE.map((line, i) => (
          <Text key={i} color="yellow" bold>
            {line}
          </Text>
        ))}
      </Box>

      {/* Game list section */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        width={boxWidth}
        paddingX={1}
      >
        {games.map((game, i) => {
          const isSelected = i === selectedIndex;
          const cursor = isSelected ? '>' : ' ';
          const highScore = getHighScore(game.metadata.id);
          const scoreText = highScore ? `${highScore.score}` : '--';
          const nameCol = `${cursor} ${game.metadata.name}`;
          const scoreCol = `Best: ${scoreText}`;
          // -4 for paddingX (1 char each side) and border (1 char each side)
          const contentWidth = boxWidth - 4;
          const line = padRight(nameCol, contentWidth - scoreCol.length) + scoreCol;

          return (
            <Text key={game.metadata.id} color={isSelected ? 'yellow' : 'white'} bold={isSelected}>
              {line}
            </Text>
          );
        })}
      </Box>

      {/* Controls section */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        width={boxWidth}
        paddingX={1}
        justifyContent="center"
      >
        <Text dimColor>Up/Down Select   Enter Play   Q Quit</Text>
      </Box>
    </Box>
  );
}
