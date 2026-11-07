/** One destination in the bottom tab bar. */
export interface Tab {
  path: string;
  label: string;
  /** SVG path data for a 24×24 stroke icon. */
  icon: string;
  /** Active only on this exact address (Games, not the game pages under /games/…). */
  exact?: boolean;
}
