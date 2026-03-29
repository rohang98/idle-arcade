import { describe, it, expect, afterEach } from 'vitest';
import { InlineDisplay } from './inline.js';

describe('InlineDisplay', () => {
  const originalIsTTY = process.stdout.isTTY;

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY });
  });

  it('is available when stdout is a TTY', async () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    const display = new InlineDisplay();
    expect(await display.isAvailable()).toBe(true);
  });

  it('is not available when stdout is not a TTY', async () => {
    Object.defineProperty(process.stdout, 'isTTY', { value: undefined, configurable: true });
    const display = new InlineDisplay();
    expect(await display.isAvailable()).toBe(false);
  });

  it('has correct id and name', () => {
    const display = new InlineDisplay();
    expect(display.id).toBe('inline');
    expect(display.name).toBe('Inline Terminal');
  });
});
