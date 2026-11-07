/** A game page's address: /games/{slug}. Slugs are unique and never change. */
export function gameLink(slug: string): string {
  return `/games/${slug}`;
}
