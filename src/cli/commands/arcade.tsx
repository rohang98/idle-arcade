import { render } from 'ink';
import { ArcadeScreen } from '../../ui/ArcadeScreen.js';

export async function arcadeCommand(): Promise<void> {
  const dimensions = {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };

  // Enter alt screen and hide cursor
  process.stdout.write('\x1b[?1049h\x1b[?25l');

  const instance = render(
    <ArcadeScreen
      dimensions={dimensions}
      onExit={() => {}}
    />,
    { exitOnCtrlC: true }
  );

  try {
    await instance.waitUntilExit();
  } finally {
    process.stdout.write('\x1b[?25h\x1b[?1049l');
  }
}
