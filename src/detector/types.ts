/**
 * State of Claude Code as detected by the daemon.
 */
export type ClaudeState = 'idle' | 'thinking' | 'active';

/**
 * Events sent from Claude Code hooks to the daemon.
 */
export interface HookEvent {
  event: 'thinking' | 'done' | 'tool_start' | 'tool_end' | 'subagent_start' | 'subagent_stop';
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Events emitted by the idle detector.
 */
export interface DetectorEvents {
  idle: () => void;
  active: () => void;
  thinking: () => void;
  stateChange: (state: ClaudeState) => void;
}

/**
 * Configuration for the idle detector.
 */
export interface DetectorConfig {
  /** Milliseconds of no activity before considered idle */
  idleThresholdMs: number;

  /** Unix socket path for receiving hook events */
  socketPath: string;
}
