import { GameSort } from '../../../core/api/models/game-sort.model';
import { GameSystem } from '../../../core/api/models/game-system.model';
import { PlayerMode } from '../models/player-mode.model';

/** Words people see for the values the API uses. */
export const MODE_LABELS: Record<PlayerMode, string> = {
  'single-player': 'Single-player',
  'co-op': 'Co-op',
  multiplayer: 'Multiplayer',
};

export const SYSTEM_LABELS: Record<GameSystem, string> = {
  PC: 'PC',
  XBOX: 'Xbox',
  PLAYSTATION: 'PlayStation',
};

export const SORT_LABELS: Record<GameSort, string> = {
  relevance: 'Best match',
  popular: 'Most popular',
  rating: 'Best rated',
  newest: 'Newest',
  name: 'Name, A to Z',
};
