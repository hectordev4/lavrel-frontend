import { TrackedGame } from '../../../core/api/models/tracked-game.model';
import { StatusFilter } from '../models/status-filter.model';
import { TrackedSort } from '../models/tracked-sort.model';

export const SORT_LABELS: Record<TrackedSort, string> = {
  release: 'Newest release',
  title: 'Title, A to Z',
  updated: 'Recently changed',
};

/** The games a status filter keeps, in the chosen order (games without a release date last). */
export function filterAndSort(
  games: TrackedGame[],
  status: StatusFilter,
  sort: TrackedSort,
): TrackedGame[] {
  const kept = status === 'ALL' ? [...games] : games.filter((g) => g.status === status);
  return kept.sort(comparator(sort));
}

function comparator(sort: TrackedSort): (a: TrackedGame, b: TrackedGame) => number {
  if (sort === 'title') return (a, b) => a.title.localeCompare(b.title);
  if (sort === 'updated') return (a, b) => b.updatedAt.localeCompare(a.updatedAt);
  return (a, b) => {
    if (a.releaseDate === b.releaseDate) return a.title.localeCompare(b.title);
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return b.releaseDate.localeCompare(a.releaseDate);
  };
}

/** True for an order the tracking list knows. */
export function isTrackedSort(value: string): value is TrackedSort {
  return value in SORT_LABELS;
}
