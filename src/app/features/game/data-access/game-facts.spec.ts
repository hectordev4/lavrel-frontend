import { gameDetails } from '../../../../testing/fixtures';
import { featureNames, systemsOf } from './game-facts';

describe('game-facts', () => {
  it('uses availableOn when the backend sends it', () => {
    expect(systemsOf(gameDetails({ availableOn: ['PC', 'XBOX'] }))).toEqual(['PC', 'XBOX']);
  });

  it('falls back to PC for a desktop game, nothing otherwise', () => {
    expect(systemsOf(gameDetails())).toEqual(['PC']);
    expect(systemsOf(gameDetails({ platforms: { windows: false, mac: false, linux: false } }))).toEqual([]);
  });

  it('lists the store features of one group', () => {
    expect(featureNames(gameDetails(), 'PLAYER_MODE')).toEqual(['Single-player']);
    expect(featureNames(gameDetails(), 'ACCESSIBILITY')).toEqual([]);
  });
});
