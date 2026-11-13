/** Under this share of owners (in %), an achievement is shown in gold as rare. */
export const RARE_BELOW = 5;

export function isRare(globalPercent: number | null | undefined): boolean {
  return globalPercent != null && globalPercent < RARE_BELOW;
}
