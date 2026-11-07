import { GameSystem } from './game-system.model';

/**
 * One game in a list (GET /api/games): enough for a result card without opening the game page.
 * topTags are the 3 most applied tags. Check the backend README for the exact fields.
 */
export interface GameCard {
  id: number;
  title: string;
  slug?: string;
  coverImageUrl: string | null;
  releaseDate: string | null;
  reviewCount: number | null;
  reviewPercentPositive: number | null;
  topTags: string[];
  singlePlayer: boolean;
  coOp: boolean;
  multiplayer: boolean;
  availableOn?: GameSystem[];
}
