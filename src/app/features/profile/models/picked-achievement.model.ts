/** An achievement on (or being picked for) an ACHIEVEMENTS shelf, with what the picker needs to show it. */
export interface PickedAchievement {
  achievementId: number;
  name: string;
  iconUrl: string | null;
  gameId: number;
  gameTitle: string;
  gameSlug: string;
  globalPercent: number | null;
  unlockedAt: string | null;
}
