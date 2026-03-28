import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

const CLAUDE_DIR = join(homedir(), '.claude');
const SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json');

interface ClaudeSettings {
  hooks?: {
    PreToolUse?: HookEntry[];
    PostToolUse?: HookEntry[];
    Stop?: HookEntry[];
    [key: string]: HookEntry[] | undefined;
  };
  [key: string]: unknown;
}

interface HookEntry {
  matcher?: string;
  hooks?: Array<{
    type: string;
    command?: string;
    timeout?: number;
  }>;
}

export function setupCommand(options?: { quiet?: boolean }): void {
  const log = options?.quiet ? (): void => {} : console.log.bind(console);

  if (!existsSync(CLAUDE_DIR)) {
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  let settings: ClaudeSettings = {};
  if (existsSync(SETTINGS_FILE)) {
    try {
      const content = readFileSync(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(content) as ClaudeSettings;
    } catch {
      // Corrupted settings — start fresh
    }
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  settings.hooks.PreToolUse = mergeHooks(settings.hooks.PreToolUse, createHookEntry('thinking'));
  settings.hooks.Stop = mergeHooks(settings.hooks.Stop, createHookEntry('done'));

  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    log(chalk.green('✓') + ' Hooks configured in ~/.claude/settings.json');
    log(chalk.dim('  Games will auto-launch when Claude is idle.'));
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to write ${SETTINGS_FILE}: ${String(err)}`);
    process.exit(1);
  }
}

function createHookEntry(event: string): HookEntry {
  return {
    matcher: "",
    hooks: [
      {
        type: 'command',
        command: `idle-arcade hook ${event}`,
        timeout: 1000,
      },
    ],
  };
}

function isOurHook(h: { command?: string }): boolean {
  if (!h.command) return false;
  return h.command.includes('idle-arcade') || h.command.includes('idl');
}

function mergeHooks(
  existing: HookEntry[] | undefined,
  newHook: HookEntry
): HookEntry[] {
  if (!existing || existing.length === 0) {
    return [newHook];
  }

  const hasOurs = existing.some((entry) => entry.hooks?.some(isOurHook));

  if (hasOurs) {
    return existing.map((entry) =>
      entry.hooks?.some(isOurHook) ? newHook : entry
    );
  }

  return [...existing, newHook];
}
