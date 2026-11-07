/** One destination in the bottom tab bar. */
export interface Tab {
  path: string;
  label: string;
  /** SVG path data for a 24×24 stroke icon. */
  icon: string;
  /** Addresses where the tab is lit (path only, no query). Defaults to the path and everything under it. */
  activeOn?: RegExp;
}
