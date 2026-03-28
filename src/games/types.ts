import type { ReactElement } from 'react';

/**
 * Configuration for game display dimensions.
 * Games should be responsive to these constraints.
 */
export interface GameDimensions {
  /** Number of columns available for the game */
  cols: number;
  /** Number of rows available for the game */
  rows: number;
}

/**
 * Current state of a game instance.
 */
export type GameState = 'idle' | 'running' | 'paused' | 'game_over';

/**
 * Events emitted by games for tracking and persistence.
 */
export interface GameEvents {
  onScoreChange?: (score: number) => void;
  onStateChange?: (state: GameState) => void;
  onGameOver?: (finalScore: number) => void;
}

/**
 * Props passed to every game component.
 * Games should implement responsive behavior based on dimensions.
 */
export interface GameProps {
  /** Available display dimensions */
  dimensions: GameDimensions;
  /** Event handlers for game lifecycle */
  events?: GameEvents;
  /** Called when the game wants to exit (e.g., user pressed 'q') */
  onExit?: () => void;
}

/**
 * Metadata about a game for the registry and UI.
 */
export interface GameMetadata {
  /** Unique identifier for the game (lowercase, no spaces) */
  id: string;
  /** Display name for the game */
  name: string;
  /** Short description of the game */
  description: string;
  /** Author or contributor name */
  author: string;
  /** Version of the game */
  version: string;
  /** Minimum terminal dimensions required */
  minDimensions: GameDimensions;
  /** Control instructions shown to users */
  controls: string;
}

/**
 * A registered game in the system.
 * Contributors implement this interface to add new games.
 */
export interface GameDefinition {
  /** Game metadata for display and validation */
  metadata: GameMetadata;
  /** React component that renders the game */
  component: (props: GameProps) => ReactElement;
}

/**
 * High score entry for persistence.
 */
export interface HighScore {
  score: number;
  date: string;
  duration?: number;
}

/**
 * Stored scores for all games.
 */
export type GameScores = Record<string, HighScore>;
