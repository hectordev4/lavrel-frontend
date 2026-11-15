import { Shelf } from '../models/public-profile.model';
import { memberSinceLabel, shelfTitle } from './shelf-labels';

const shelf = (over: Partial<Shelf> = {}): Shelf => ({
  id: 's',
  type: 'PLAYING',
  title: null,
  collectionName: null,
  games: [],
  achievements: null,
  stats: null,
  ...over,
});

describe('shelf labels', () => {
  it('uses the owner’s title, then the collection’s name, then the type’s name', () => {
    expect(shelfTitle(shelf({ title: 'Platinum hunt' }))).toBe('Platinum hunt');
    expect(shelfTitle(shelf({ type: 'COLLECTION', collectionName: 'Cozy games' }))).toBe(
      'Cozy games',
    );
    expect(shelfTitle(shelf({ type: 'STATS' }))).toBe('At a glance');
  });

  it('writes the month they joined', () => {
    expect(memberSinceLabel('2026-10')).toBe('October 2026');
    expect(memberSinceLabel(null)).toBeNull();
  });
});
