import { NextAchievement } from './next-achievement.model';
import { TrackingStatus } from './tracking-status.model';

/**
 * A game in the tracking list. pinPosition is null when it isn't pinned to Home (quick access);
 * nextAchievements are the 3 easiest locked ones, by share of owners who unlocked them.
 */
export interface TrackedGame {
  gameId: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  releaseDate: string | null;
  status: TrackingStatus;
  pinPosition: number | null;
  unlocked: number;
  total: number;
  nextAchievements: NextAchievement[];
  addedAt: string;
  updatedAt: string;
}
