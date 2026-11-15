import { playtimeLabel } from './library-labels';

describe('playtimeLabel', () => {
  it.each([
    [0, 'Not played'],
    [45, '45 min'],
    [720, '12 h'],
    [72240, '1,204 h'],
  ])('%i minutes reads "%s"', (minutes, text) => {
    expect(playtimeLabel(minutes)).toBe(text);
  });
});

describe('isLibrarySort', () => {
  it('accepts known sorts only', async () => {
    const { isLibrarySort } = await import('./library-labels');
    expect(isLibrarySort('playtime')).toBe(true);
    expect(isLibrarySort('rating')).toBe(false);
  });
});
