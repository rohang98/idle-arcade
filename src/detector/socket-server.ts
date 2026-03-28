import { createServer, type Server, type Socket } from 'net';
import { unlinkSync, existsSync } from 'fs';
import type { HookEvent } from './types.js';
import type { IdleDetector } from './index.js';

/**
 * Unix socket server that receives hook events as newline-delimited JSON.
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

  async start(): Promise<void> {
    if (existsSync(this.socketPath)) {
      try {
        unlinkSync(this.socketPath);
      } catch {
        throw new Error(`Cannot remove stale socket at ${this.socketPath}`);
      }
    }

    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => this.handleConnection(socket));
      this.server.on('error', reject);
      this.server.listen(this.socketPath, resolve);
    });
  }

  async stop(): Promise<void> {
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
        if (existsSync(this.socketPath)) {
          try { unlinkSync(this.socketPath); } catch { /* cleanup best-effort */ }
        }
        this.server = null;
        resolve();
      });
    });
  }

  getSocketPath(): string {
    return this.socketPath;
  }

  private handleConnection(socket: Socket): void {
    this.connections.add(socket);
    let buffer = '';

    socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) this.processMessage(trimmed);
      }
    });

    socket.on('close', () => this.connections.delete(socket));
    socket.on('error', () => this.connections.delete(socket));
  }

  private processMessage(message: string): void {
    try {
      const event = JSON.parse(message) as HookEvent;
      if (!event.event) return;
      if (!event.timestamp) event.timestamp = Date.now();
      this.detector.onEvent(event);
    } catch {
      // Malformed JSON — ignore
    }
  }
}
