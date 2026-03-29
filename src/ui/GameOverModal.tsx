import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { GAME_OVER_TEXT, centerText } from './ascii-art.js';

export interface GameOverModalProps {
  score: number;
  highScore: number | null;
  isNewHighScore: boolean;
  width: number;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
  onQuit: () => void;
}

type ModalOption = 'play_again' | 'return_to_menu' | 'quit';

const OPTIONS: { id: ModalOption; label: string }[] = [
  { id: 'play_again', label: 'Play Again' },
  { id: 'return_to_menu', label: 'Return to Menu' },
  { id: 'quit', label: 'Quit' },
];

const BORDER = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
} as const;

export function GameOverModal({
  score,
  highScore,
  isNewHighScore,
  width,
  onPlayAgain,
  onReturnToMenu,
  onQuit,
}: GameOverModalProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalWidth = Math.min(width, 40);
  const innerWidth = modalWidth - 2;

  const topBorder =
    BORDER.topLeft + BORDER.horizontal.repeat(innerWidth) + BORDER.topRight;
  const bottomBorder =
    BORDER.bottomLeft + BORDER.horizontal.repeat(innerWidth) + BORDER.bottomRight;
  const emptyLine =
    BORDER.vertical + ' '.repeat(innerWidth) + BORDER.vertical;

  useInput((input, key) => {
    if (key.upArrow || input === 'k' || input === 'w') {
      setSelectedIndex((i) => (i > 0 ? i - 1 : OPTIONS.length - 1));
    } else if (key.downArrow || input === 'j' || input === 's') {
      setSelectedIndex((i) => (i < OPTIONS.length - 1 ? i + 1 : 0));
    } else if (key.return) {
      const option = OPTIONS[selectedIndex];
      if (option) {
        switch (option.id) {
          case 'play_again':
            onPlayAgain();
            break;
          case 'return_to_menu':
            onReturnToMenu();
            break;
          case 'quit':
            onQuit();
            break;
        }
      }
    }
  });

  const row = (content: string, color: string): React.ReactElement => (
    <Box>
      <Text color="red">{BORDER.vertical}</Text>
      <Text color={color}>{centerText(content, innerWidth)}</Text>
      <Text color="red">{BORDER.vertical}</Text>
    </Box>
  );

  return (
    <Box flexDirection="column" alignItems="center" marginTop={1}>
      <Text color="red">{topBorder}</Text>
      <Text color="red">{emptyLine}</Text>

      {/* GAME OVER title */}
      <Box>
        <Text color="red">{BORDER.vertical}</Text>
        <Text color="red" bold>
          {centerText(GAME_OVER_TEXT, innerWidth)}
        </Text>
        <Text color="red">{BORDER.vertical}</Text>
      </Box>

      <Text color="red">{emptyLine}</Text>

      {/* Score */}
      {row(`Score: ${score}`, 'yellow')}

      {/* High score */}
      {highScore !== null
        ? row(`High Score: ${highScore}`, 'white')
        : null}

      {/* New high score celebration */}
      {isNewHighScore ? row('★ NEW HIGH SCORE! ★', 'green') : null}

      <Text color="red">{emptyLine}</Text>

      {/* Options */}
      {OPTIONS.map((option, i) => {
        const isSelected = i === selectedIndex;
        const cursor = isSelected ? '▸' : ' ';
        const label = `${cursor} ${option.label}`;
        return (
          <Box key={option.id}>
            <Text color="red">{BORDER.vertical}</Text>
            <Text color={isSelected ? 'yellow' : 'white'} bold={isSelected}>
              {centerText(label, innerWidth)}
            </Text>
            <Text color="red">{BORDER.vertical}</Text>
          </Box>
        );
      })}

      <Text color="red">{emptyLine}</Text>
      <Text color="red">{bottomBorder}</Text>
    </Box>
  );
}
