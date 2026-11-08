import { Platform } from '../../../core/api/models/platform.model';
import { ProfileAvatar } from '../../../core/api/models/profile-avatar.model';

/** GET /api/users/{publicId}: a public profile's header and its shelves, in the owner's order. */
export interface PublicProfile {
  profile: PublicProfileHeader;
  shelves: Shelf[];
}

/** country, platforms and avatar are only sent when the owner opted into showing them. */
export interface PublicProfileHeader {
  publicId: string | number;
  username: string;
  /** "2026-10": the month they joined. */
  memberSince: string | null;
  country: { code: string; name: string } | null;
  platforms: Platform[] | null;
  avatar?: ProfileAvatar | null;
}

export type ShelfType = 'COLLECTION' | 'RECENTLY_PLAYED' | 'PLAYING' | 'COMPLETED' | 'ACHIEVEMENTS' | 'STATS';

/** One filled shelf: games, achievements or stats depending on its type. title null: use the type's name. */
export interface Shelf {
  id: string;
  type: ShelfType;
  title: string | null;
  collectionName: string | null;
  games: ShelfGame[] | null;
  achievements: ShelfAchievement[] | null;
  stats: ShelfStats | null;
}

export interface ShelfGame {
  gameId: number;
  title: string;
  slug?: string;
  coverImageUrl: string | null;
}

export interface ShelfAchievement {
  achievementId?: number;
  name: string;
  iconUrl: string | null;
  gameTitle?: string;
  gameSlug?: string;
  /** Share of the game's owners who unlocked it; null while nobody owns the game. */
  globalPercent: number | null;
}

/** gamesOwned is null unless the owner chose to show the size of their library. */
export interface ShelfStats {
  gamesOwned: number | null;
  achievementsUnlocked: number;
  gamesCompleted: number;
}
