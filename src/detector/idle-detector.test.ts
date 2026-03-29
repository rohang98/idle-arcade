import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IdleDetector } from './index.js';

describe('IdleDetector', () => {
  let detector: IdleDetector;

  beforeEach(() => {
    vi.useFakeTimers();
    detector = new IdleDetector({ idleThresholdMs: 2000 });
  });

  afterEach(() => {
    detector.destroy();
    vi.useRealTimers();
  });

  it('starts in idle state', () => {
    expect(detector.getState()).toBe('idle');
  });

  it('transitions to thinking on thinking event', () => {
    const spy = vi.fn();
    detector.on('thinking', spy);

    detector.onEvent({ event: 'thinking' });

    expect(detector.getState()).toBe('thinking');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('transitions to thinking on tool_start event', () => {
    detector.onEvent({ event: 'tool_start' });
    expect(detector.getState()).toBe('thinking');
  });

  it('transitions to thinking on subagent_start event', () => {
    detector.onEvent({ event: 'subagent_start' });
    expect(detector.getState()).toBe('thinking');
  });

  it('transitions to active then idle on done event', () => {
    const activeSpy = vi.fn();
    const idleSpy = vi.fn();
    detector.on('active', activeSpy);
    detector.on('idle', idleSpy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'done' });

    expect(detector.getState()).toBe('active');
    expect(activeSpy).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(2000);

    expect(detector.getState()).toBe('idle');
    expect(idleSpy).toHaveBeenCalledOnce();
  });

  it('transitions to active on tool_end event', () => {
    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'tool_end' });
    expect(detector.getState()).toBe('active');
  });

  it('transitions to active on subagent_stop event', () => {
    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'subagent_stop' });
    expect(detector.getState()).toBe('active');
  });

  it('clears debounce when new thinking event arrives', () => {
    const idleSpy = vi.fn();
    detector.on('idle', idleSpy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'done' });

    vi.advanceTimersByTime(1500);
    detector.onEvent({ event: 'thinking' });
    vi.advanceTimersByTime(2000);

    // Should not have gone idle — the thinking event reset the debounce
    expect(idleSpy).not.toHaveBeenCalled();
    expect(detector.getState()).toBe('thinking');
  });

  it('does not emit duplicate state transitions', () => {
    const spy = vi.fn();
    detector.on('thinking', spy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'thinking' });

    expect(spy).toHaveBeenCalledOnce();
  });

  it('markActive transitions to active and starts debounce', () => {
    const idleSpy = vi.fn();
    detector.on('idle', idleSpy);

    detector.markActive();
    expect(detector.getState()).toBe('active');

    vi.advanceTimersByTime(2000);
    expect(detector.getState()).toBe('idle');
    expect(idleSpy).toHaveBeenCalledOnce();
  });

  it('markActiveNoDebounce does not start idle timer', () => {
    const idleSpy = vi.fn();
    detector.on('idle', idleSpy);

    detector.markActiveNoDebounce();
    expect(detector.getState()).toBe('active');

    vi.advanceTimersByTime(5000);
    expect(detector.getState()).toBe('active');
    expect(idleSpy).not.toHaveBeenCalled();
  });

  it('markIdle transitions directly to idle', () => {
    detector.onEvent({ event: 'thinking' });
    detector.markIdle();
    expect(detector.getState()).toBe('idle');
  });

  it('destroy clears timers and listeners', () => {
    const spy = vi.fn();
    detector.on('idle', spy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'done' });
    detector.destroy();

    vi.advanceTimersByTime(5000);
    expect(spy).not.toHaveBeenCalled();
  });

  it('respects custom idleThresholdMs', () => {
    detector.destroy();
    detector = new IdleDetector({ idleThresholdMs: 500 });
    const idleSpy = vi.fn();
    detector.on('idle', idleSpy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'done' });

    vi.advanceTimersByTime(499);
    expect(idleSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(idleSpy).toHaveBeenCalledOnce();
  });

  it('emits stateChange on every transition', () => {
    const spy = vi.fn();
    detector.on('stateChange', spy);

    detector.onEvent({ event: 'thinking' });
    detector.onEvent({ event: 'done' });
    vi.advanceTimersByTime(2000);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, 'thinking');
    expect(spy).toHaveBeenNthCalledWith(2, 'active');
    expect(spy).toHaveBeenNthCalledWith(3, 'idle');
  });
});
