import { describe, it, expect } from 'vitest';
import { centerText, horizontalRule, padRight, padLeft, ARCADE_TITLE, GAME_OVER_TEXT } from './ascii-art.js';

describe('centerText', () => {
  it('centers text in given width', () => {
    const result = centerText('hi', 10);
    expect(result).toBe('    hi    ');
    expect(result.length).toBe(10);
  });

  it('handles odd padding', () => {
    const result = centerText('hi', 9);
    expect(result.length).toBe(9);
    expect(result.trim()).toBe('hi');
  });

  it('truncates text longer than width', () => {
    const result = centerText('hello world', 5);
    expect(result).toBe('hello');
    expect(result.length).toBe(5);
  });

  it('returns text as-is when exact width', () => {
    const result = centerText('abc', 3);
    expect(result).toBe('abc');
  });
});

describe('horizontalRule', () => {
  it('creates rule of given width', () => {
    expect(horizontalRule(5)).toBe('═════');
  });

  it('uses custom character', () => {
    expect(horizontalRule(3, '-')).toBe('---');
  });

  it('returns empty string for zero width', () => {
    expect(horizontalRule(0)).toBe('');
  });
});

describe('padRight', () => {
  it('pads text to given width', () => {
    const result = padRight('hi', 5);
    expect(result).toBe('hi   ');
    expect(result.length).toBe(5);
  });

  it('truncates text longer than width', () => {
    expect(padRight('hello', 3)).toBe('hel');
  });
});

describe('padLeft', () => {
  it('pads text to given width', () => {
    const result = padLeft('hi', 5);
    expect(result).toBe('   hi');
    expect(result.length).toBe(5);
  });

  it('truncates text longer than width', () => {
    expect(padLeft('hello', 3)).toBe('hel');
  });
});

describe('constants', () => {
  it('ARCADE_TITLE is an array of strings', () => {
    expect(Array.isArray(ARCADE_TITLE)).toBe(true);
    expect(ARCADE_TITLE.length).toBeGreaterThan(0);
    for (const line of ARCADE_TITLE) {
      expect(typeof line).toBe('string');
    }
  });

  it('GAME_OVER_TEXT is a string', () => {
    expect(typeof GAME_OVER_TEXT).toBe('string');
    expect(GAME_OVER_TEXT).toContain('G A M E');
    expect(GAME_OVER_TEXT).toContain('O V E R');
  });
});
