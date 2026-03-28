import type { ReactElement } from 'react';

/**
 * Display strategy for launching games.
 */
export interface DisplayStrategy {
  /** Unique identifier for this display strategy */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /**
   * Check if this display strategy is available in the current environment.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Launch a game component using this display strategy.
   * @param component The React component to render
   * @returns A handle to dismiss the display
   */
  launch(component: ReactElement): Promise<DisplayHandle>;
}

/**
 * Handle for controlling an active display.
 */
export interface DisplayHandle {
  /**
   * Dismiss the display immediately.
   */
  dismiss(): Promise<void>;

  /**
   * Check if the display is still active.
   */
  isActive(): boolean;
}

/**
 * Options for display manager.
 */
export interface DisplayOptions {
  /** Preferred display strategy (if available) */
  preferredStrategy?: string;

  /** Title to show (if supported) */
  title?: string;

  /** Width percentage for popup displays */
  width?: number;

  /** Height percentage for popup displays */
  height?: number;
}
