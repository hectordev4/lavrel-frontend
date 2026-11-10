import { gameLink } from './game-link';

describe('gameLink', () => {
  it('builds /games/{slug}', () => {
    expect(gameLink('doom-2')).toBe('/games/doom-2');
  });
});
