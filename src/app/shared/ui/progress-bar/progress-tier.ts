import { ProgressTier } from './progress-tier.model';

/** 0–19 gray, 20–49 bronze, 50–79 silver, 80–89 gold, 90–99 gold with an aura, 100 perfect. */
export function progressTier(percent: number): ProgressTier {
  if (percent >= 100) return 'perfect';
  if (percent >= 90) return 'gold-aura';
  if (percent >= 80) return 'gold';
  if (percent >= 50) return 'silver';
  if (percent >= 20) return 'bronze';
  return 'gray';
}

/** Whole percentage of unlocked out of total, never rounding up to 100 before everything is unlocked. */
export function progressPercent(unlocked: number, total: number): number {
  if (total <= 0) return 0;
  if (unlocked >= total) return 100;
  return Math.min(99, Math.floor((unlocked / total) * 100));
}
