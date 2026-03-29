import { describe, it, expect, vi } from 'vitest';
import { DisplayManager } from './index.js';
import type { DisplayHandle, DisplayStrategy } from './types.js';
import type { ReactElement } from 'react';

const dummyComponent = null as unknown as ReactElement;

function createMockStrategy(
  id: string,
  available: boolean
): DisplayStrategy & { launch: ReturnType<typeof vi.fn> } {
  const handle: DisplayHandle = {
    dismiss: vi.fn(async () => {}),
    isActive: vi.fn(() => true),
  };

  return {
    id,
    name: id,
    isAvailable: vi.fn(async () => available),
    launch: vi.fn(async () => handle),
  };
}

describe('DisplayManager', () => {
  it('selects first available strategy', async () => {
    const unavailable = createMockStrategy('a', false);
    const available = createMockStrategy('b', true);
    const manager = new DisplayManager([unavailable, available]);

    await manager.launch(dummyComponent);

    expect(unavailable.launch).not.toHaveBeenCalled();
    expect(available.launch).toHaveBeenCalledOnce();
  });

  it('uses preferred strategy when available', async () => {
    const first = createMockStrategy('first', true);
    const preferred = createMockStrategy('preferred', true);
    const manager = new DisplayManager([first, preferred]);

    await manager.launch(dummyComponent, { preferredStrategy: 'preferred' });

    expect(first.launch).not.toHaveBeenCalled();
    expect(preferred.launch).toHaveBeenCalledOnce();
  });

  it('falls back when preferred strategy is unavailable', async () => {
    const preferred = createMockStrategy('preferred', false);
    const fallback = createMockStrategy('fallback', true);
    const manager = new DisplayManager([preferred, fallback]);

    await manager.launch(dummyComponent, { preferredStrategy: 'preferred' });

    expect(fallback.launch).toHaveBeenCalledOnce();
  });

  it('throws when no strategy is available', async () => {
    const unavailable = createMockStrategy('a', false);
    const manager = new DisplayManager([unavailable]);

    await expect(manager.launch(dummyComponent)).rejects.toThrow(
      'No display strategy available'
    );
  });

  it('throws with empty strategies list', async () => {
    const manager = new DisplayManager([]);
    await expect(manager.launch(dummyComponent)).rejects.toThrow(
      'No display strategy available'
    );
  });

  it('dismiss delegates to active handle', async () => {
    const strategy = createMockStrategy('a', true);
    const manager = new DisplayManager([strategy]);

    const handle = await manager.launch(dummyComponent);
    await manager.dismiss();

    expect(handle.dismiss).toHaveBeenCalled();
  });

  it('dismiss is safe when nothing is active', async () => {
    const manager = new DisplayManager([]);
    await expect(manager.dismiss()).resolves.toBeUndefined();
  });

  it('isActive returns false when nothing launched', () => {
    const manager = new DisplayManager([]);
    expect(manager.isActive()).toBe(false);
  });

  it('isActive reflects handle state', async () => {
    const strategy = createMockStrategy('a', true);
    const manager = new DisplayManager([strategy]);

    await manager.launch(dummyComponent);
    expect(manager.isActive()).toBe(true);
  });

  it('launch dismisses existing before launching new', async () => {
    const strategy = createMockStrategy('a', true);
    const manager = new DisplayManager([strategy]);

    const handle1 = await manager.launch(dummyComponent);
    await manager.launch(dummyComponent);

    expect(handle1.dismiss).toHaveBeenCalled();
    expect(strategy.launch).toHaveBeenCalledTimes(2);
  });
});
