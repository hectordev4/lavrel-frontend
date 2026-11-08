import { PublicProfileHeader } from './public-profile.model';

/** idle: fewer than 2 characters typed. */
export type PlayerSearchState =
  | { kind: 'idle' }
  | { kind: 'loading'; query: string }
  | { kind: 'ready'; query: string; players: PublicProfileHeader[] }
  | { kind: 'error'; query: string };
