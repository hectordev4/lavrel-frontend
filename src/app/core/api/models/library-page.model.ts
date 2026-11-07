import { LibraryGame } from './library-game.model';

/** A page of the library: 48 games by default, up to 96. */
export interface LibraryPage {
  games: LibraryGame[];
  page: number;
  size: number;
  hasMore: boolean;
}
