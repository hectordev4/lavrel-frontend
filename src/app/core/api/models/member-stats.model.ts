/**
 * GET /api/currentuser/stats (private). averageCompletion: average over games with at least one unlock,
 * one decimal, null when there are none yet. perfectGames: games with achievements, all unlocked.
 */
export interface MemberStats {
  achievementsUnlocked: number;
  averageCompletion: number | null;
  perfectGames: number;
  gamesOwned: number;
}
