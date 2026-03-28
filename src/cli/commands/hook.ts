import { connect } from 'net';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SOCKET_PATH } from '../../config.js';

/**
 * Send an event to the idl daemon, auto-starting it if needed.
 * Called by Claude Code hooks — must complete within 1000ms.
 */
export async function hookCommand(event: string): Promise<void> {
  const sent = await trySendEvent(event);
  if (sent) return;

  // Daemon not running — spawn it in background
  spawnDaemon();

  // Brief wait for daemon to bind the socket, then retry
  await sleep(300);
  await trySendEvent(event);
}

function trySendEvent(event: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ path: SOCKET_PATH });

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 500);

    socket.on('connect', () => {
      socket.write(`{"event":"${event}"}\n`);
      socket.end();
      clearTimeout(timeout);
      resolve(true);
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

function spawnDaemon(): void {
  // Resolve the CLI entry point relative to this file
  const thisFile = fileURLToPath(import.meta.url);
  const cliEntry = join(dirname(thisFile), '..', 'index.js');

  const proc = spawn(process.execPath, [cliEntry, 'watch'], {
    detached: true,
    stdio: 'ignore',
  });

  proc.unref();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
