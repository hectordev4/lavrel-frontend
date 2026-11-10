import { relativeTime } from './relative-time';

const now = Date.parse('2026-11-08T12:00:00Z');
const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString();

describe('relativeTime', () => {
  it.each([
    [10, 'just now'],
    [5 * 60, '5 minutes ago'],
    [2 * 3600, '2 hours ago'],
    [24 * 3600, 'yesterday'],
    [3 * 24 * 3600, '3 days ago'],
  ])('%i seconds ago reads "%s"', (seconds, text) => {
    expect(relativeTime(ago(seconds), now)).toBe(text);
  });
});
