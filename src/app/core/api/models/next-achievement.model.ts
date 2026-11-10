/** One of the easiest achievements not unlocked yet. hidden: show blurred until tapped. */
export interface NextAchievement {
  achievementId: number;
  name: string;
  iconUrl: string | null;
  hidden: boolean;
  globalPercent: number | null;
}
