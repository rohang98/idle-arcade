import { render } from 'ink';
import type { ReactElement } from 'react';
import type { DisplayHandle, DisplayStrategy } from './types.js';

/**
 * Inline display strategy.
 * Renders games directly in the current terminal using Ink.
 * Uses alternate screen buffer to preserve terminal content.
 */
export class InlineDisplay implements DisplayStrategy {
  readonly id = 'inline';
  readonly name = 'Inline Terminal';

  private activeInstance: { unmount: () => void } | null = null;

  isAvailable(): Promise<boolean> {
    // Always available as fallback
    return Promise.resolve(process.stdout.isTTY ?? false);
  }

  launch(component: ReactElement): Promise<DisplayHandle> {
    // Dismiss any existing instance
    if (this.activeInstance) {
      this.activeInstance.unmount();
      this.activeInstance = null;
    }

    // Enter alternate screen buffer
    process.stdout.write('\x1b[?1049h');
    // Hide cursor
    process.stdout.write('\x1b[?25l');

    let isActive = true;

    const instance = render(component, {
      exitOnCtrlC: true,
    });

    this.activeInstance = instance;

    const dismiss = (): Promise<void> => {
      if (!isActive) return Promise.resolve();
      isActive = false;

      instance.unmount();
      this.activeInstance = null;

      // Show cursor
      process.stdout.write('\x1b[?25h');
      // Exit alternate screen buffer
      process.stdout.write('\x1b[?1049l');
      return Promise.resolve();
    };

    // Handle cleanup on unmount
    void instance.waitUntilExit().then(() => {
      if (isActive) {
        isActive = false;
        // Show cursor
        process.stdout.write('\x1b[?25h');
        // Exit alternate screen buffer
        process.stdout.write('\x1b[?1049l');
      }
    });

    return Promise.resolve({
      dismiss,
      isActive: () => isActive,
    });
  }
}

export const inlineDisplay = new InlineDisplay();
