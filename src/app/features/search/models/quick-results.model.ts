import { GameCard } from '../../../core/api/models/game-card.model';
import { CreatorOption } from './creator-option.model';
import { TagOption } from './tag-option.model';

/** GET /api/search: up to 5 games, 5 tags and 3 franchises for what was typed so far. */
export interface QuickResults {
  games: GameCard[];
  tags: TagOption[];
  franchises: CreatorOption[];
}
