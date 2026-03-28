import { EventEmitter } from 'events';
import type { ClaudeState, DetectorConfig, DetectorEvents, HookEvent } from './types.js';
import { SOCKET_PATH } from '../config.js';

export * from './types.js';

const DEFAULT_CONFIG: DetectorConfig = {
  idleThresholdMs: 2000,
  socketPath: SOCKET_PATH,
};

/**
 * State machine that tracks Claude Code activity.
 *
 * Transitions:
 * - tool/subagent event → 'thinking'
 * - 'done' event → 'active', then after debounce → 'idle'
 */
export class IdleDetector extends EventEmitter {
  private state: ClaudeState = 'idle';
  private config: DetectorConfig;
  private debounceTimer: NodeJS.Timeout | null = null;
  constructor(config: Partial<DetectorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getState(): ClaudeState {
    return this.state;
  }

  getSocketPath(): string {
    return this.config.socketPath;
  }

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

  markIdle(): void {
    this.clearDebounce();
    this.setState('idle');
  }

  markActive(): void {
    this.clearDebounce();
    this.setState('active');
    this.startIdleDebounce();
  }

  /** Mark active without restarting idle timer. Used after game exit to wait for next hook event. */
  markActiveNoDebounce(): void {
    this.clearDebounce();
    this.setState('active');
  }

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
