/** A tag to filter by; use id as GET /api/games?tag={id}. gameCount: published games it really describes. */
export interface TagOption {
  id: number;
  name: string;
  gameCount: number;
}
