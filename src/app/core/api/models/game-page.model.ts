import { GameCard } from './game-card.model';

/** A page of games. hasMore instead of a total: exact totals are slow on fuzzy searches. */
export interface GamePage {
  games: GameCard[];
  page: number;
  size: number;
  hasMore: boolean;
}
