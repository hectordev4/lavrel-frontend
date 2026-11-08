/** The kinds of shelf a public profile can have. Profile (to manage them) and Players (to show them) share these. */
export type ShelfType = 'COLLECTION' | 'RECENTLY_PLAYED' | 'PLAYING' | 'COMPLETED' | 'ACHIEVEMENTS' | 'STATS';

/** The name a shelf shows when its owner didn't give it a title. */
export const SHELF_TYPE_NAMES: Record<ShelfType, string> = {
  COLLECTION: 'Collection',
  RECENTLY_PLAYED: 'Recently played',
  PLAYING: 'Playing now',
  COMPLETED: 'Completed',
  ACHIEVEMENTS: 'Achievements',
  STATS: 'At a glance',
};

/** What each type shows, for the shelf picker. */
export const SHELF_TYPE_HINTS: Record<ShelfType, string> = {
  COLLECTION: 'One of your collections. Putting it on a shelf makes it public.',
  RECENTLY_PLAYED: 'The last 6 games you played.',
  PLAYING: 'Tracked games marked Playing.',
  COMPLETED: 'Games with every achievement unlocked.',
  ACHIEVEMENTS: 'Up to 12 of your unlocks, picked by you, with their rarity.',
  STATS: 'Achievements unlocked, games completed and, if you choose, games owned.',
};

export const SHELF_TYPES = Object.keys(SHELF_TYPE_NAMES) as ShelfType[];

/** A profile has at most 10 shelves; only collections can appear more than once. */
export const MAX_SHELVES = 10;
export const MAX_SHELF_ACHIEVEMENTS = 12;
