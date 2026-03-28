import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

const CLAUDE_DIR = join(homedir(), '.claude');
const SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json');
const SOCKET_PATH = '/tmp/idl.sock';

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
  matcher?: Record<string, unknown>;
  hooks?: Array<{
    type: string;
    command?: string;
    timeout?: number;
  }>;
}

/**
 * Auto-configure Claude Code hooks for idl integration.
 */
export function setupCommand(): void {
  console.log(chalk.cyan('idl setup') + ' - Configure Claude Code hooks\n');

  // Check if Claude directory exists
  if (!existsSync(CLAUDE_DIR)) {
    console.log(chalk.yellow('Creating ~/.claude directory...'));
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  // Read existing settings
  let settings: ClaudeSettings = {};
  if (existsSync(SETTINGS_FILE)) {
    try {
      const content = readFileSync(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(content) as ClaudeSettings;
      console.log(chalk.green('✓') + ' Found existing settings.json');
    } catch (err) {
      console.log(chalk.yellow('⚠') + ' Could not parse existing settings.json, will create new one');
    }
  } else {
    console.log(chalk.dim('No existing settings.json, creating new one'));
  }

  // Initialize hooks if needed
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Add PreToolUse hook
  const preToolUseHook = createHookEntry('thinking');
  settings.hooks.PreToolUse = mergeHooks(settings.hooks.PreToolUse, preToolUseHook);

  // Add Stop hook
  const stopHook = createHookEntry('done');
  settings.hooks.Stop = mergeHooks(settings.hooks.Stop, stopHook);

  // Write updated settings
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    console.log(chalk.green('✓') + ' Updated ~/.claude/settings.json');
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to write settings: ${String(err)}`);
    process.exit(1);
  }

  console.log();
  console.log(chalk.green('Setup complete!'));
  console.log();
  console.log('Next steps:');
  console.log(chalk.dim('  1. Start the idl daemon:'));
  console.log(chalk.white('     idl watch'));
  console.log();
  console.log(chalk.dim('  2. Use Claude Code normally'));
  console.log(chalk.dim('     Games will launch when Claude is thinking!'));
}

function createHookEntry(event: string): HookEntry {
  return {
    matcher: {},
    hooks: [
      {
        type: 'command',
        command: `echo '{"event":"${event}"}' | nc -U ${SOCKET_PATH}`,
        timeout: 1000,
      },
    ],
  };
}

function mergeHooks(
  existing: HookEntry[] | undefined,
  newHook: HookEntry
): HookEntry[] {
  if (!existing || existing.length === 0) {
    return [newHook];
  }

  // Check if idl hook already exists
  const hasIdlHook = existing.some((entry) =>
    entry.hooks?.some((h) => h.command?.includes('idl.sock'))
  );

  if (hasIdlHook) {
    // Update existing idl hook
    return existing.map((entry) => {
      const hasIdl = entry.hooks?.some((h) => h.command?.includes('idl.sock'));
      if (hasIdl) {
        return newHook;
      }
      return entry;
    });
  }

  // Add new hook
  return [...existing, newHook];
}
