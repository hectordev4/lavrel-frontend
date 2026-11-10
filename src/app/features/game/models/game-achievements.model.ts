import { Achievement } from './achievement.model';

/** GET /api/games/{id}/achievements. unlocked is null for visitors without an account. */
export interface GameAchievements {
  gameId: number;
  total: number;
  unlocked: number | null;
  achievements: Achievement[];
}
