import { render } from 'ink';
import type { ReactElement } from 'react';
import type { DisplayHandle, DisplayOptions, DisplayStrategy } from './types.js';

function enterAltScreen(): void {
  process.stdout.write('\x1b[?1049h\x1b[?25l');
}

function exitAltScreen(): void {
  process.stdout.write('\x1b[?25h\x1b[?1049l');
}

export class InlineDisplay implements DisplayStrategy {
  readonly id = 'inline';
  readonly name = 'Inline Terminal';

  private activeInstance: { unmount: () => void } | null = null;

  isAvailable(): Promise<boolean> {
    return Promise.resolve(process.stdout.isTTY ?? false);
  }

  launch(component: ReactElement, _options?: DisplayOptions): Promise<DisplayHandle> {
    if (this.activeInstance) {
      this.activeInstance.unmount();
      this.activeInstance = null;
    }

    enterAltScreen();

    let isActive = true;
    const instance = render(component, { exitOnCtrlC: true });
    this.activeInstance = instance;

    const restore = (): void => {
      if (!isActive) return;
      isActive = false;
      instance.unmount();
      this.activeInstance = null;
      exitAltScreen();
    };

    void instance.waitUntilExit().then(restore);

    return Promise.resolve({
      dismiss: () => {
        restore();
        return Promise.resolve();
      },
      isActive: () => isActive,
    });
  }
}

export const inlineDisplay = new InlineDisplay();
