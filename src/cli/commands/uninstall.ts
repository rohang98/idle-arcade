import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

const SETTINGS_FILE = join(homedir(), '.claude', 'settings.json');

interface HookEntry {
  matcher?: string;
  hooks?: Array<{
    type: string;
    command?: string;
    timeout?: number;
  }>;
}

interface ClaudeSettings {
  hooks?: {
    [key: string]: HookEntry[] | undefined;
  };
  [key: string]: unknown;
}

function isOurHook(h: { command?: string }): boolean {
  if (!h.command) return false;
  return h.command.includes('idle-arcade');
}

export function uninstallCommand(): void {
  if (!existsSync(SETTINGS_FILE)) {
    console.log(chalk.yellow('No Claude Code settings found — nothing to remove.'));
    return;
  }

  let settings: ClaudeSettings;
  try {
    settings = JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8')) as ClaudeSettings;
  } catch {
    console.error(chalk.red('✗') + ' Failed to read ~/.claude/settings.json');
    process.exit(1);
  }

  if (!settings.hooks) {
    console.log(chalk.yellow('No hooks found — nothing to remove.'));
    return;
  }

  let removed = false;

  for (const key of Object.keys(settings.hooks)) {
    const entries = settings.hooks[key];
    if (!entries) continue;

    const filtered = entries.filter(
      (entry) => !entry.hooks?.some(isOurHook)
    );

    if (filtered.length < entries.length) {
      removed = true;
      if (filtered.length === 0) {
        delete settings.hooks[key];
      } else {
        settings.hooks[key] = filtered;
      }
    }
  }

  // Clean up empty hooks object
  if (settings.hooks && Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  if (!removed) {
    console.log(chalk.yellow('No idle-arcade hooks found — nothing to remove.'));
    return;
  }

  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    console.log(chalk.green('✓') + ' Removed idle-arcade hooks from ~/.claude/settings.json');
    console.log(chalk.dim('  Run `npm uninstall -g idle-arcade` to remove the package.'));
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to write settings: ${String(err)}`);
    process.exit(1);
  }
}
