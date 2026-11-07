import { LibrarySort } from './library-sort.model';

/** Query for GET /api/currentuser/games. Filters work like the catalog search. */
export interface LibraryParams {
  q?: string;
  tags?: number[];
  modes?: ('single-player' | 'co-op' | 'multiplayer')[];
  collection?: string;
  sort?: LibrarySort;
  page?: number;
  size?: number;
}
