/**
 * One achievement of a game. Percentages have one decimal: globalPercent is null while nobody owns the game,
 * countryPercent is null without a country or with too few players there. unlocked and unlockedAt only mean
 * something when signed in. hidden: show it blurred until tapped.
 */
export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  hidden: boolean;
  globalPercent: number | null;
  countryPercent: number | null;
  unlocked: boolean;
  unlockedAt: string | null;
}
