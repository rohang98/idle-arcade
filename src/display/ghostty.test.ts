import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GhosttyDisplay, findGhosttyBinary } from './ghostty.js';
import * as child_process from 'child_process';
import { EventEmitter } from 'events';
import type { ReactElement } from 'react';

vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof child_process>('child_process');
  return {
    ...actual,
    spawn: vi.fn(),
    exec: vi.fn(),
  };
});

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => false),
  };
});

const mockSpawn = vi.mocked(child_process.spawn);
const mockExec = vi.mocked(child_process.exec);

function createMockProcess(): EventEmitter & { kill: ReturnType<typeof vi.fn>; unref: ReturnType<typeof vi.fn> } {
  const proc = new EventEmitter() as EventEmitter & {
    kill: ReturnType<typeof vi.fn>;
    unref: ReturnType<typeof vi.fn>;
  };
  proc.kill = vi.fn();
  proc.unref = vi.fn();
  return proc;
}

const dummyComponent = null as unknown as ReactElement;

describe('findGhosttyBinary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns path from which when ghostty is on PATH', async () => {
    mockExec.mockImplementation((_cmd: string, callback: unknown) => {
      (callback as (err: null, result: { stdout: string }) => void)(null, {
        stdout: '/usr/local/bin/ghostty\n',
      });
      return undefined as never;
    });

    const result = await findGhosttyBinary();
    expect(result).toBe('/usr/local/bin/ghostty');
  });

  it('falls back to macOS app bundle path', async () => {
    mockExec.mockImplementation((_cmd: string, callback: unknown) => {
      (callback as (err: Error) => void)(new Error('not found'));
      return undefined as never;
    });

    const { existsSync } = await import('fs');
    vi.mocked(existsSync).mockReturnValue(true);

    const result = await findGhosttyBinary();
    expect(result).toBe('/Applications/Ghostty.app/Contents/MacOS/ghostty');
  });

  it('returns null when ghostty is not available', async () => {
    mockExec.mockImplementation((_cmd: string, callback: unknown) => {
      (callback as (err: Error) => void)(new Error('not found'));
      return undefined as never;
    });

    const { existsSync } = await import('fs');
    vi.mocked(existsSync).mockReturnValue(false);

    const result = await findGhosttyBinary();
    expect(result).toBeNull();
  });
});

describe('GhosttyDisplay', () => {
  let display: GhosttyDisplay;

  beforeEach(() => {
    vi.clearAllMocks();
    display = new GhosttyDisplay();

    // Default: ghostty available on PATH
    mockExec.mockImplementation((_cmd: string, callback: unknown) => {
      (callback as (err: null, result: { stdout: string }) => void)(null, {
        stdout: '/usr/local/bin/ghostty\n',
      });
      return undefined as never;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has correct id and name', () => {
    expect(display.id).toBe('ghostty');
    expect(display.name).toBe('Ghostty Window');
  });

  it('isAvailable returns true when binary exists', async () => {
    expect(await display.isAvailable()).toBe(true);
  });

  it('isAvailable returns false when binary not found', async () => {
    mockExec.mockImplementation((_cmd: string, callback: unknown) => {
      (callback as (err: Error) => void)(new Error('not found'));
      return undefined as never;
    });

    expect(await display.isAvailable()).toBe(false);
  });

  it('launch spawns ghostty with correct arguments', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    await display.launch(dummyComponent, {
      gameId: 'snake',
      width: 80,
      height: 30,
      title: 'idle-arcade',
    });

    expect(mockSpawn).toHaveBeenCalledOnce();
    const [binary, args] = mockSpawn.mock.calls[0]!;
    expect(binary).toBe('/usr/local/bin/ghostty');
    expect(args).toContain('--window-width=80');
    expect(args).toContain('--window-height=30');
    expect(args).toContain('--title=idle-arcade');
    expect(args).toContain('--quit-after-last-window-closed=true');
  });

  it('launch uses default options when none provided', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    await display.launch(dummyComponent);

    const [, args] = mockSpawn.mock.calls[0]!;
    expect(args).toContain('--window-width=80');
    expect(args).toContain('--window-height=30');
    expect(args).toContain('--title=idle-arcade');
  });

  it('handle reports active after launch', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    const handle = await display.launch(dummyComponent);
    expect(handle.isActive()).toBe(true);
  });

  it('dismiss kills the process', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    const handle = await display.launch(dummyComponent);
    await handle.dismiss();

    expect(proc.kill).toHaveBeenCalledWith('SIGTERM');
    expect(handle.isActive()).toBe(false);
  });

  it('dismiss is idempotent', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    const handle = await display.launch(dummyComponent);
    await handle.dismiss();
    await handle.dismiss();

    expect(proc.kill).toHaveBeenCalledOnce();
  });

  it('handle becomes inactive when process exits', async () => {
    const proc = createMockProcess();
    mockSpawn.mockReturnValue(proc as never);

    const handle = await display.launch(dummyComponent);
    proc.emit('exit');

    expect(handle.isActive()).toBe(false);
  });

  it('launching again dismisses the previous window', async () => {
    const proc1 = createMockProcess();
    const proc2 = createMockProcess();
    mockSpawn.mockReturnValueOnce(proc1 as never).mockReturnValueOnce(proc2 as never);

    const handle1 = await display.launch(dummyComponent);
    await display.launch(dummyComponent);

    expect(proc1.kill).toHaveBeenCalledWith('SIGTERM');
    expect(handle1.isActive()).toBe(false);
  });
});
