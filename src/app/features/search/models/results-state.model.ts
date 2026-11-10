import { GameCard } from '../../../core/api/models/game-card.model';

/** The results list: first page loading, loaded (maybe loading more), or failed. */
export type ResultsState =
  | { kind: 'loading' }
  | { kind: 'ready'; games: GameCard[]; hasMore: boolean; loadingMore: boolean; moreError: string | null }
  | { kind: 'error'; message: string };
