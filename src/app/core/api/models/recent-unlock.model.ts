/** One of the member's latest unlocks (GET /api/currentuser/achievements/recent), newest first. */
export interface RecentUnlock {
  achievementId: number;
  name: string;
  iconUrl: string | null;
  hidden: boolean;
  gameId: number;
  gameSlug: string;
  gameTitle: string;
  unlockedAt: string;
  /** Share of owners worldwide, one decimal; null while nobody owns the game. */
  globalPercent: number | null;
}
