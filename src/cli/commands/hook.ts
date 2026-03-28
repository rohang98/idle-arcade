import { connect } from 'net';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SOCKET_PATH } from '../../config.js';

/**
 * Hook handler invoked by Claude Code. Must complete within 1000ms.
 * Sends event to daemon socket, starting the daemon if needed.
 */
export async function hookCommand(event: string): Promise<void> {
  if (await trySendEvent(event)) return;

  spawnDaemon();
  await new Promise((r) => setTimeout(r, 300));
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
  const thisFile = fileURLToPath(import.meta.url);
  const cliEntry = join(dirname(thisFile), '..', 'index.js');

  const proc = spawn(process.execPath, [cliEntry, 'watch'], {
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}
