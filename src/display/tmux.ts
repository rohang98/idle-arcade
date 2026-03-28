import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import type { DisplayHandle, DisplayOptions, DisplayStrategy } from './types.js';
import type { ReactElement } from 'react';

const exec = promisify(execCb);

export class TmuxDisplay implements DisplayStrategy {
  readonly id = 'tmux';
  readonly name = 'tmux Popup';

  private activePopup: { dismiss: () => Promise<void> } | null = null;

  async isAvailable(): Promise<boolean> {
    try {
      await exec('tmux -V');
      return !!process.env['TMUX'];
    } catch {
      return false;
    }
  }

  async launch(_component: ReactElement, options?: DisplayOptions): Promise<DisplayHandle> {
    if (this.activePopup) {
      await this.activePopup.dismiss();
    }

    const gameId = options?.gameId ?? 'snake';
    const width = options?.width ?? 60;
    const height = options?.height ?? 40;
    const title = options?.title ?? 'idle-arcade';

    const popupCmd = `node ${process.argv[1]} play ${gameId} --popup`;

    let isActive = true;

    const dismiss = async (): Promise<void> => {
      if (!isActive) return;
      isActive = false;
      try {
        await exec('tmux display-popup -C 2>/dev/null || true');
      } catch { /* popup already closed */ }
      this.activePopup = null;
    };

    const proc = spawn('tmux', [
      'display-popup', '-E',
      '-w', `${width}%`,
      '-h', `${height}%`,
      '-T', title,
      popupCmd,
    ], { stdio: 'ignore', detached: true });

    proc.on('exit', () => {
      isActive = false;
      this.activePopup = null;
    });
    proc.unref();

    const handle: DisplayHandle = { dismiss, isActive: () => isActive };
    this.activePopup = handle;
    return handle;
  }
}

export const tmuxDisplay = new TmuxDisplay();
