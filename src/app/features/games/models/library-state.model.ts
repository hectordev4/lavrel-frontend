import { LibraryGame } from '../../../core/api/models/library-game.model';

/** My library: first page loading, loaded (maybe loading more), or failed. */
export type LibraryState =
  | { kind: 'loading' }
  | { kind: 'ready'; games: LibraryGame[]; hasMore: boolean; loadingMore: boolean; moreError: string | null }
  | { kind: 'error'; message: string };
