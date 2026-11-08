import { trackedGame } from '../../../../testing/fixtures';
import { filterAndSort } from './tracked-list';

const games = [
  trackedGame(1, { title: 'Beta', releaseDate: '2020-01-01', status: 'BACKLOG', updatedAt: '2026-03-01T00:00:00Z' }),
  trackedGame(2, { title: 'Alpha', releaseDate: null, updatedAt: '2026-01-01T00:00:00Z' }),
  trackedGame(3, { title: 'Gamma', releaseDate: '2025-06-01', updatedAt: '2026-02-01T00:00:00Z' }),
];

describe('filterAndSort', () => {
  it('sorts by newest release, without a date last', () => {
    expect(filterAndSort(games, 'ALL', 'release').map((g) => g.gameId)).toEqual([3, 1, 2]);
  });

  it('sorts by title and by recent change', () => {
    expect(filterAndSort(games, 'ALL', 'title').map((g) => g.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(filterAndSort(games, 'ALL', 'updated').map((g) => g.gameId)).toEqual([1, 3, 2]);
  });

  it('keeps one status', () => {
    expect(filterAndSort(games, 'BACKLOG', 'release').map((g) => g.gameId)).toEqual([1]);
  });
});
