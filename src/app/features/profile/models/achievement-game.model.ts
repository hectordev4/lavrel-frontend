/** A game where I've unlocked at least one achievement (GET /api/currentuser/achievements/games). */
export interface AchievementGame {
  gameId: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  unlocked: number;
  total: number;
  lastUnlockedAt: string | null;
}

export interface AchievementGamePage {
  games: AchievementGame[];
  page: number;
  size: number;
  hasMore: boolean;
}

/** One of my unlocks in a game (GET /api/currentuser/games/{gameId}/achievements/unlocked). */
export interface UnlockedAchievement {
  achievementId: number;
  name: string;
  iconUrl: string | null;
  hidden: boolean;
  globalPercent: number | null;
  unlockedAt: string | null;
}
