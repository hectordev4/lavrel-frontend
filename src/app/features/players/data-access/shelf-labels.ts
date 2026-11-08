import { Shelf, ShelfType } from '../models/public-profile.model';

/** The name a shelf shows when its owner didn't give it a title. */
export const SHELF_TYPE_NAMES: Record<ShelfType, string> = {
  COLLECTION: 'Collection',
  RECENTLY_PLAYED: 'Recently played',
  PLAYING: 'Playing now',
  COMPLETED: 'Completed',
  ACHIEVEMENTS: 'Achievements',
  STATS: 'At a glance',
};

export function shelfTitle(shelf: Shelf): string {
  return shelf.title || (shelf.type === 'COLLECTION' && shelf.collectionName) || SHELF_TYPE_NAMES[shelf.type];
}

/** "2026-10" → "October 2026". */
export function memberSinceLabel(yearMonth: string | null): string | null {
  if (!yearMonth) return null;
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
