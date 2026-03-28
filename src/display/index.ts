import type { ReactElement } from 'react';
import type { DisplayHandle, DisplayOptions, DisplayStrategy } from './types.js';
import { tmuxDisplay } from './tmux.js';
import { inlineDisplay } from './inline.js';

export * from './types.js';
export { tmuxDisplay } from './tmux.js';
export { inlineDisplay } from './inline.js';

class DisplayManager {
  private strategies: DisplayStrategy[] = [tmuxDisplay, inlineDisplay];
  private activeHandle: DisplayHandle | null = null;

  async launch(
    component: ReactElement,
    options: DisplayOptions = {}
  ): Promise<DisplayHandle> {
    await this.dismiss();

    const strategy = options.preferredStrategy
      ? this.strategies.find((s) => s.id === options.preferredStrategy)
      : undefined;

    const selected = strategy && (await strategy.isAvailable())
      ? strategy
      : await this.firstAvailable();

    if (!selected) {
      throw new Error('No display strategy available');
    }

    this.activeHandle = await selected.launch(component, options);
    return this.activeHandle;
  }

  async dismiss(): Promise<void> {
    if (this.activeHandle?.isActive()) {
      await this.activeHandle.dismiss();
    }
    this.activeHandle = null;
  }

  isActive(): boolean {
    return this.activeHandle?.isActive() ?? false;
  }

  private async firstAvailable(): Promise<DisplayStrategy | null> {
    for (const s of this.strategies) {
      if (await s.isAvailable()) return s;
    }
    return null;
  }
}

export const displayManager = new DisplayManager();
