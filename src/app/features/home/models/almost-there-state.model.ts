import { LibraryGame } from '../../../core/api/models/library-game.model';

/** Owned games closest to 100%, for Home. */
export type AlmostThereState =
  | { kind: 'loading' }
  | { kind: 'ready'; games: LibraryGame[] }
  | { kind: 'error' };
