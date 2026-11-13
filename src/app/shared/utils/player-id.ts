/** A player id in groups of four, as people read it: 4829103755210846 → "4829 1037 5521 0846". */
export function formatPlayerId(id: string | number | null | undefined): string {
  return String(id ?? '').replace(/(\d{4})(?=\d)/g, '$1 ');
}
