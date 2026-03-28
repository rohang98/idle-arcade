import type { ReactElement } from 'react';
import type { DisplayHandle, DisplayOptions, DisplayStrategy } from './types.js';
import { tmuxDisplay } from './tmux.js';
import { inlineDisplay } from './inline.js';

export * from './types.js';
export { tmuxDisplay } from './tmux.js';
export { inlineDisplay } from './inline.js';

/**
 * Display manager that auto-detects the best display strategy.
 */
class DisplayManager {
  private strategies: DisplayStrategy[] = [tmuxDisplay, inlineDisplay];
  private activeHandle: DisplayHandle | null = null;

  /**
   * Register a custom display strategy.
   * Strategies are tried in order of registration (first registered = highest priority).
   */
  registerStrategy(strategy: DisplayStrategy, priority: 'high' | 'low' = 'low'): void {
    if (priority === 'high') {
      this.strategies.unshift(strategy);
    } else {
      // Insert before inline (which is always last as fallback)
      this.strategies.splice(this.strategies.length - 1, 0, strategy);
    }
  }

  /**
   * Get all available display strategies in the current environment.
   */
  async getAvailableStrategies(): Promise<DisplayStrategy[]> {
    const available: DisplayStrategy[] = [];

    for (const strategy of this.strategies) {
      if (await strategy.isAvailable()) {
        available.push(strategy);
      }
    }

    return available;
  }

  /**
   * Get the best available display strategy.
   */
  async getBestStrategy(preferred?: string): Promise<DisplayStrategy | null> {
    // If preferred strategy specified, try it first
    if (preferred) {
      const preferredStrategy = this.strategies.find((s) => s.id === preferred);
      if (preferredStrategy && (await preferredStrategy.isAvailable())) {
        return preferredStrategy;
      }
    }

    // Otherwise, use first available
    for (const strategy of this.strategies) {
      if (await strategy.isAvailable()) {
        return strategy;
      }
    }

    return null;
  }

  /**
   * Launch a component using the best available display strategy.
   */
  async launch(
    component: ReactElement,
    options: DisplayOptions = {}
  ): Promise<DisplayHandle> {
    // Dismiss any active display first
    await this.dismiss();

    const strategy = await this.getBestStrategy(options.preferredStrategy);

    if (!strategy) {
      throw new Error('No display strategy available');
    }

    this.activeHandle = await strategy.launch(component, options);
    return this.activeHandle;
  }

  /**
   * Dismiss any active display.
   */
  async dismiss(): Promise<void> {
    if (this.activeHandle?.isActive()) {
      await this.activeHandle.dismiss();
    }
    this.activeHandle = null;
  }

  /**
   * Check if there's an active display.
   */
  isActive(): boolean {
    return this.activeHandle?.isActive() ?? false;
  }
}

// Singleton instance
export const displayManager = new DisplayManager();
