import { SHELF_TYPE_NAMES } from '../../../core/profile/shelf-types';
import { Shelf } from '../models/public-profile.model';

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
