import { GameSort } from '../../../core/api/models/game-sort.model';
import { GameSystem } from '../../../core/api/models/game-system.model';
import { NamedFilter } from './named-filter.model';
import { PlayerMode } from './player-mode.model';

/** Everything that narrows a search. Lives in the address, so results can be shared and reloaded. */
export interface SearchFilters {
  q: string | null;
  tags: NamedFilter[];
  franchise: NamedFilter | null;
  developer: NamedFilter | null;
  publisher: NamedFilter | null;
  modes: PlayerMode[];
  system: GameSystem | null;
  sort: GameSort | null;
}
