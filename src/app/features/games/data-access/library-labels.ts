import { LibrarySort } from '../../../core/api/models/library-sort.model';

export const LIBRARY_SORT_LABELS: Record<LibrarySort, string> = {
  recent: 'Recently played',
  name: 'Name, A to Z',
  playtime: 'Most played',
  progress: 'Most completed',
  newest: 'Newest release',
};

/** "45 min", "12 h", "1,204 h". */
export function playtimeLabel(minutes: number): string {
  if (minutes <= 0) return 'Not played';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60).toLocaleString('en')} h`;
}

/** True for a sort the library knows, so a value read from the page can be trusted. */
export function isLibrarySort(value: string): value is LibrarySort {
  return value in LIBRARY_SORT_LABELS;
}
