import { isGameSort } from './search-labels';

describe('isGameSort', () => {
  it('accepts known sorts only', () => {
    expect(isGameSort('rating')).toBe(true);
    expect(isGameSort('whatever')).toBe(false);
  });
});
