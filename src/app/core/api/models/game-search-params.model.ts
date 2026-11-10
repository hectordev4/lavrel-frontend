import { GameSort } from './game-sort.model';
import { GameSystem } from './game-system.model';

/** Query for GET /api/games. Tags are matched all together (up to 5). */
export interface GameSearchParams {
  q?: string;
  tags?: number[];
  franchise?: number;
  developer?: number;
  publisher?: number;
  modes?: ('single-player' | 'co-op' | 'multiplayer')[];
  system?: GameSystem;
  sort?: GameSort;
  page?: number;
  size?: number;
}
