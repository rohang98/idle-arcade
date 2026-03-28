import { EventEmitter } from 'events';
import type { ClaudeState, DetectorConfig, DetectorEvents, HookEvent } from './types.js';
import { SOCKET_PATH } from '../config.js';

export * from './types.js';

const DEFAULT_CONFIG: DetectorConfig = {
  idleThresholdMs: 2000,
  socketPath: SOCKET_PATH,
};

/**
 * Idle detector state machine.
 *
 * Receives events from Claude Code hooks and determines
 * when Claude is idle (good time to show a game) vs active.
 *
 * State transitions:
 * - Any tool/subagent event → 'thinking'
 * - 'done' event → 'active' briefly, then after debounce → 'idle'
 * - No events for idleThresholdMs → 'idle'
 */
export class IdleDetector extends EventEmitter {
  private state: ClaudeState = 'idle';
  private config: DetectorConfig;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<DetectorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the current detected state.
   */
  getState(): ClaudeState {
    return this.state;
  }

  /**
   * Get the socket path for hook communication.
   */
  getSocketPath(): string {
    return this.config.socketPath;
  }

  /**
   * Process an event from Claude Code hooks.
   */
  onEvent(event: HookEvent): void {
    this.clearDebounce();

    switch (event.event) {
      case 'thinking':
      case 'tool_start':
      case 'subagent_start':
        this.setState('thinking');
        break;

      case 'done':
      case 'tool_end':
      case 'subagent_stop':
        this.setState('active');
        this.startIdleDebounce();
        break;
    }
  }

  /**
   * Manually mark as idle (e.g., for demo mode).
   */
  markIdle(): void {
    this.clearDebounce();
    this.setState('idle');
  }

  /**
   * Manually mark as active (e.g., user started typing).
   */
  markActive(): void {
    this.clearDebounce();
    this.setState('active');
    this.startIdleDebounce();
  }

  /**
   * Clean up timers.
   */
  destroy(): void {
    this.clearDebounce();
    this.removeAllListeners();
  }

  private setState(newState: ClaudeState): void {
    if (this.state === newState) return;

    this.state = newState;

    this.emit('stateChange', newState);
    this.emit(newState);
  }

  private startIdleDebounce(): void {
    this.debounceTimer = setTimeout(() => {
      this.setState('idle');
    }, this.config.idleThresholdMs);
  }

  private clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // Type-safe event emitter methods
  override on<K extends keyof DetectorEvents>(
    event: K,
    listener: DetectorEvents[K]
  ): this {
    return super.on(event, listener);
  }

  override emit<K extends keyof DetectorEvents>(
    event: K,
    ...args: Parameters<DetectorEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}
