import { GameCard } from '../../../core/api/models/game-card.model';

/** One list on the discover home: loading, loaded or failed. */
export type DiscoverSection =
  | { kind: 'loading' }
  | { kind: 'ready'; games: GameCard[] }
  | { kind: 'error'; message: string };
