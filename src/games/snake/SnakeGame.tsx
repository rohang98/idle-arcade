import { Box, Text, useApp, useInput } from 'ink';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameProps } from '../types.js';
import { createInitialState, tick } from './logic.js';
import type { Direction, SnakeState } from './types.js';

// Visual constants
const BORDER = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
} as const;

const SNAKE_HEAD = '●';
const SNAKE_BODY = '○';
const FOOD = '◆';
const EMPTY = ' ';

const TICK_MS = 100;

export function SnakeGame({
  dimensions,
  events,
  onExit,
  hideDefaultGameOver,
}: GameProps): React.ReactElement {
  const { exit } = useApp();

  const gameWidth = Math.max(10, dimensions.cols - 4);
  const gameHeight = Math.max(6, dimensions.rows - 4);

  const [state, setState] = useState<SnakeState>(() =>
    createInitialState(gameWidth, gameHeight)
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const lastScoreRef = useRef(0);

  useEffect(() => {
    if (state.score !== lastScoreRef.current) {
      lastScoreRef.current = state.score;
      events?.onScoreChange?.(state.score);
    }
  }, [state.score, events]);

  useEffect(() => {
    if (state.isGameOver) {
      events?.onStateChange?.('game_over');
      events?.onGameOver?.(state.score);
    }
  }, [state.isGameOver, state.score, events]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((s) => tick(s, gameWidth, gameHeight));
    }, TICK_MS);
    return (): void => { clearInterval(interval); };
  }, [gameWidth, gameHeight]);

  const restart = useCallback(function restartGame(): void {
    setState(createInitialState(gameWidth, gameHeight));
    events?.onStateChange?.('running');
  }, [gameWidth, gameHeight, events]);

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      onExit?.();
      exit();
      return;
    }

    if (stateRef.current.isGameOver) {
      if (!hideDefaultGameOver && (input === 'r' || input === 'R')) {
        restart();
      }
      return;
    }

    if (input === 'p' || input === 'P') {
      setState((s) => ({ ...s, isPaused: !s.isPaused }));
      events?.onStateChange?.(stateRef.current.isPaused ? 'running' : 'paused');
      return;
    }

    let newDirection: Direction | null = null;

    if (key.upArrow || input === 'w' || input === 'k') {
      newDirection = 'up';
    } else if (key.downArrow || input === 's' || input === 'j') {
      newDirection = 'down';
    } else if (key.leftArrow || input === 'a' || input === 'h') {
      newDirection = 'left';
    } else if (key.rightArrow || input === 'd' || input === 'l') {
      newDirection = 'right';
    }

    if (newDirection) {
      setState((s) => ({ ...s, nextDirection: newDirection }));
    }
  });

  const renderGrid = (): string[] => {
    const grid: string[][] = Array.from({ length: gameHeight }, () =>
      Array.from({ length: gameWidth }, () => EMPTY)
    );

    const foodRow = grid[state.food.y];
    if (foodRow) {
      foodRow[state.food.x] = FOOD;
    }

    state.snake.forEach((segment, index) => {
      const row = grid[segment.y];
      if (row) {
        row[segment.x] = index === 0 ? SNAKE_HEAD : SNAKE_BODY;
      }
    });

    return grid.map((row) => row.join(''));
  };

  const gridLines = renderGrid();
  const bottomBorder =
    BORDER.bottomLeft +
    BORDER.horizontal.repeat(gameWidth) +
    BORDER.bottomRight;

  // Score display (right-aligned in top area)
  const scoreText = `Score: ${state.score}`;

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">{BORDER.topLeft}</Text>
        <Text color="cyan">
          {BORDER.horizontal.repeat(Math.max(0, gameWidth - scoreText.length))}
        </Text>
        <Text color="yellow" bold>
          {scoreText}
        </Text>
        <Text color="cyan">{BORDER.topRight}</Text>
      </Box>

      {gridLines.map((line, i) => (
        <Box key={i}>
          <Text color="cyan">{BORDER.vertical}</Text>
          <Text>
            {line.split('').map((char, j) => {
              if (char === SNAKE_HEAD) {
                return (
                  <Text key={j} color="green" bold>
                    {char}
                  </Text>
                );
              }
              if (char === SNAKE_BODY) {
                return (
                  <Text key={j} color="greenBright">
                    {char}
                  </Text>
                );
              }
              if (char === FOOD) {
                return (
                  <Text key={j} color="red" bold>
                    {char}
                  </Text>
                );
              }
              return <Text key={j}>{char}</Text>;
            })}
          </Text>
          <Text color="cyan">{BORDER.vertical}</Text>
        </Box>
      ))}

      <Text color="cyan">{bottomBorder}</Text>

      {!hideDefaultGameOver || !state.isGameOver ? (
        <Box marginTop={1}>
          {state.isGameOver ? (
            <Text color="red" bold>
              Game Over! Press R to restart, Q to quit
            </Text>
          ) : state.isPaused ? (
            <Text color="yellow">Paused - Press P to resume</Text>
          ) : (
            <Text dimColor>
              ←↑↓→/WASD to move | P pause | Q quit
            </Text>
          )}
        </Box>
      ) : null}
    </Box>
  );
}
