import { GameDetails } from './game-details.model';

/** The game page: loading, loaded, not in the catalog, or failed. */
export type GamePageState =
  | { kind: 'loading' }
  | { kind: 'ready'; game: GameDetails }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };
