import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import { existsSync } from 'fs';
import type { DisplayHandle, DisplayOptions, DisplayStrategy } from './types.js';
import type { ReactElement } from 'react';

const exec = promisify(execCb);

const MACOS_APP_PATH = '/Applications/Ghostty.app/Contents/MacOS/ghostty';

export async function findGhosttyBinary(): Promise<string | null> {
  try {
    const { stdout } = await exec('which ghostty');
    return stdout.trim();
  } catch {
    // Fall back to macOS app bundle path
    if (existsSync(MACOS_APP_PATH)) {
      return MACOS_APP_PATH;
    }
    return null;
  }
}

export class GhosttyDisplay implements DisplayStrategy {
  readonly id = 'ghostty';
  readonly name = 'Ghostty Window';

  private activeHandle: DisplayHandle | null = null;

  async isAvailable(): Promise<boolean> {
    return (await findGhosttyBinary()) !== null;
  }

  async launch(_component: ReactElement, options?: DisplayOptions): Promise<DisplayHandle> {
    if (this.activeHandle) {
      await this.activeHandle.dismiss();
    }

    const binary = await findGhosttyBinary();
    if (!binary) {
      throw new Error('Ghostty binary not found');
    }

    const gameId = options?.gameId ?? 'snake';
    const width = options?.width ?? 80;
    const height = options?.height ?? 30;
    const title = options?.title ?? 'idle-arcade';

    const playCmd = `${process.execPath} ${process.argv[1]} play ${gameId} --popup`;

    let isActive = true;

    const proc = spawn(binary, [
      `-e`, playCmd,
      `--window-width=${width}`,
      `--window-height=${height}`,
      `--title=${title}`,
      `--quit-after-last-window-closed=true`,
    ], { stdio: 'ignore' });

    proc.on('exit', () => {
      isActive = false;
      this.activeHandle = null;
    });

    const dismiss = async (): Promise<void> => {
      if (!isActive) return;
      isActive = false;
      proc.kill('SIGTERM');
      this.activeHandle = null;
    };

    const handle: DisplayHandle = { dismiss, isActive: () => isActive };
    this.activeHandle = handle;
    return handle;
  }
}

export const ghosttyDisplay = new GhosttyDisplay();
