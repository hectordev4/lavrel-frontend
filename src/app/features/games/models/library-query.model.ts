import { LibrarySort } from '../../../core/api/models/library-sort.model';

/** What My library shows: a name filter, an order, and optionally one collection. */
export interface LibraryQuery {
  q: string;
  sort: LibrarySort;
  collection: string | null;
}
