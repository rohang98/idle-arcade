import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import type { DisplayHandle, DisplayStrategy } from './types.js';
import type { ReactElement } from 'react';

const exec = promisify(execCb);

/**
 * tmux popup display strategy.
 * Launches games in a tmux popup window that floats over the current pane.
 */
export class TmuxDisplay implements DisplayStrategy {
  readonly id = 'tmux';
  readonly name = 'tmux Popup';

  private activePopup: { dismiss: () => Promise<void> } | null = null;

  async isAvailable(): Promise<boolean> {
    try {
      // Check if tmux is installed
      await exec('tmux -V');

      // Check if we're inside a tmux session
      const tmuxEnv = process.env['TMUX'];
      return !!tmuxEnv;
    } catch {
      return false;
    }
  }

  async launch(_component: ReactElement): Promise<DisplayHandle> {
    // Dismiss any existing popup first
    if (this.activePopup) {
      await this.activePopup.dismiss();
    }

    const width = 60;
    const height = 40;
    const title = 'idl';

    // We'll spawn a new process that renders the component
    // For now, we use the CLI entry point with a special flag
    const popupCmd = `node ${process.argv[1]} play snake --popup`;

    const tmuxArgs = [
      'display-popup',
      '-E', // Close popup when command exits
      '-w',
      `${width}%`,
      '-h',
      `${height}%`,
      '-T',
      title,
      popupCmd,
    ];

    let isActive = true;

    const dismiss = async (): Promise<void> => {
      if (!isActive) return;
      isActive = false;

      try {
        // Send escape to close popup, or kill the popup pane
        await exec('tmux display-popup -C 2>/dev/null || true');
      } catch {
        // Popup may already be closed
      }

      this.activePopup = null;
    };

    // Spawn tmux popup (non-blocking)
    const proc = spawn('tmux', tmuxArgs, {
      stdio: 'ignore',
      detached: true,
    });

    proc.on('exit', () => {
      isActive = false;
      this.activePopup = null;
    });

    proc.unref();

    const handle: DisplayHandle = {
      dismiss,
      isActive: () => isActive,
    };

    this.activePopup = handle;
    return handle;
  }
}

export const tmuxDisplay = new TmuxDisplay();
