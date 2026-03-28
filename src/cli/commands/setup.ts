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
  matcher?: Record<string, unknown>;
  hooks?: Array<{
    type: string;
    command?: string;
    timeout?: number;
  }>;
}

/**
 * Auto-configure Claude Code hooks for idl integration.
 * When `quiet` is true, suppresses decorative output (used during postinstall).
 */
export function setupCommand(options?: { quiet?: boolean }): void {
  const log = options?.quiet ? (): void => {} : console.log.bind(console);

  log(chalk.cyan('idle-arcade setup') + ' - Configure Claude Code hooks\n');

  // Check if Claude directory exists
  if (!existsSync(CLAUDE_DIR)) {
    log(chalk.yellow('Creating ~/.claude directory...'));
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  // Read existing settings
  let settings: ClaudeSettings = {};
  if (existsSync(SETTINGS_FILE)) {
    try {
      const content = readFileSync(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(content) as ClaudeSettings;
      log(chalk.green('✓') + ' Found existing settings.json');
    } catch {
      log(chalk.yellow('⚠') + ' Could not parse existing settings.json, will create new one');
    }
  } else {
    log(chalk.dim('No existing settings.json, creating new one'));
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
    log(chalk.green('✓') + ' Updated ~/.claude/settings.json');
  } catch (err) {
    console.error(chalk.red('✗') + ` Failed to write settings: ${String(err)}`);
    process.exit(1);
  }

  log();
  log(chalk.green('Setup complete!'));
  log();
  log(chalk.dim('Use Claude Code normally — games will auto-launch when Claude is thinking!'));
  log(chalk.dim('The daemon starts automatically on the first hook event.'));
}

function createHookEntry(event: string): HookEntry {
  return {
    matcher: {},
    hooks: [
      {
        type: 'command',
        command: `idle-arcade hook ${event}`,
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

  // Check if idl hook already exists (matches both old nc-based and new idl hook commands)
  const isIdlHook = (h: { command?: string }): boolean =>
    !!h.command && (h.command.includes('idle-arcade hook') || h.command.includes('idle-arcade.sock') || h.command.includes('idl.sock') || h.command.includes('idl hook'));

  const hasIdlHook = existing.some((entry) =>
    entry.hooks?.some(isIdlHook)
  );

  if (hasIdlHook) {
    // Update existing idl hook
    return existing.map((entry) => {
      const hasIdl = entry.hooks?.some(isIdlHook);
      if (hasIdl) {
        return newHook;
      }
      return entry;
    });
  }

  // Add new hook
  return [...existing, newHook];
}
