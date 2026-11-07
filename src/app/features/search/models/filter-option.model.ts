/** One choice in a filter's type-ahead: a tag or a creator, with how many games it has. */
export interface FilterOption {
  id: number;
  name: string;
  gameCount: number;
}
