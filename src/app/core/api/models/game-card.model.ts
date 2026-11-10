import { GameSystem } from './game-system.model';

/**
 * One game in a list (GET /api/games): enough for a result card without opening the game page.
 * topTags are the 3 most applied tags. The backend README's example is the reference for this shape.
 */
export interface GameCard {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  releaseDate: string | null;
  reviewCount: number | null;
  reviewPercentPositive: number | null;
  topTags: string[];
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  modes: GameModes;
  availableOn?: GameSystem[];
}

/** Which player modes the game offers. */
export interface GameModes {
  singlePlayer: boolean;
  coOp: boolean;
  multiplayer: boolean;
}
