/**
 * ASCII art and text helpers for the retro arcade UI.
 */

export const ARCADE_TITLE = [
  ' ___  ____  __    ____    ',
  '(_  )(_  _)(  )  ( ___)   ',
  ' _)(_  )(   )(__  )__)    ',
  '(____)(__) (____)(____) ',
  '  __  ____   ___   __  ____  ____ ',
  ' / _\\(  _ \\ / __) / _\\(    \\( ___)',
  '/    \\ )   /( (__ /    \\ ) D ( )__) ',
  '\\_/\\_/(__\\_) \\___)\\_/\\_/(____/(____)',
];

export const GAME_OVER_TEXT = 'G A M E   O V E R';

/**
 * Center a string within a given width.
 */
export function centerText(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  return ' '.repeat(left) + text + ' '.repeat(width - left - text.length);
}

/**
 * Create a horizontal rule of a given width.
 */
export function horizontalRule(width: number, char = '═'): string {
  return char.repeat(width);
}

/**
 * Pad a string to a given width, right-aligned.
 */
export function padRight(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return text + ' '.repeat(width - text.length);
}

/**
 * Pad a string to a given width, left-aligned (right-padded with spaces on the left).
 */
export function padLeft(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  return ' '.repeat(width - text.length) + text;
}
