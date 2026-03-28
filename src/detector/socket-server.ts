import { createServer, type Server, type Socket } from 'net';
import { unlinkSync, existsSync } from 'fs';
import type { HookEvent } from './types.js';
import type { IdleDetector } from './index.js';

/**
 * Unix socket server that receives events from Claude Code hooks.
 *
 * Hooks send JSON messages like: {"event":"thinking"}
 * The server parses these and forwards to the IdleDetector.
 */
export class SocketServer {
  private server: Server | null = null;
  private socketPath: string;
  private detector: IdleDetector;
  private connections: Set<Socket> = new Set();

  constructor(detector: IdleDetector) {
    this.detector = detector;
    this.socketPath = detector.getSocketPath();
  }

  /**
   * Start listening for hook events.
   */
  async start(): Promise<void> {
    // Clean up existing socket file
    if (existsSync(this.socketPath)) {
      try {
        unlinkSync(this.socketPath);
      } catch {
        throw new Error(`Cannot remove existing socket at ${this.socketPath}`);
      }
    }

    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(this.socketPath, () => {
        resolve();
      });
    });
  }

  /**
   * Stop the server and clean up.
   */
  async stop(): Promise<void> {
    // Close all connections
    for (const socket of this.connections) {
      socket.destroy();
    }
    this.connections.clear();

    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        // Clean up socket file
        if (existsSync(this.socketPath)) {
          try {
            unlinkSync(this.socketPath);
          } catch {
            // Ignore cleanup errors
          }
        }
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Get the socket path for external use (e.g., hook configuration).
   */
  getSocketPath(): string {
    return this.socketPath;
  }

  private handleConnection(socket: Socket): void {
    this.connections.add(socket);

    let buffer = '';

    socket.on('data', (data) => {
      buffer += data.toString();

      // Process complete lines (messages end with newline)
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.trim()) {
          this.processMessage(line.trim());
        }
      }
    });

    socket.on('close', () => {
      this.connections.delete(socket);
    });

    socket.on('error', () => {
      this.connections.delete(socket);
    });
  }

  private processMessage(message: string): void {
    try {
      const event = JSON.parse(message) as HookEvent;

      if (!event.event) {
        return;
      }

      // Add timestamp if not present
      if (!event.timestamp) {
        event.timestamp = Date.now();
      }

      this.detector.onEvent(event);
    } catch {
      // Ignore malformed messages
    }
  }
}
