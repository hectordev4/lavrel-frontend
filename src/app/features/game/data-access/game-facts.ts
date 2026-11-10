import { GameSystem } from '../../../core/api/models/game-system.model';
import { GameDetails } from '../models/game-details.model';

const SYSTEM_LABELS: Record<GameSystem, string> = { PC: 'PC', XBOX: 'Xbox', PLAYSTATION: 'PlayStation' };

/** Systems to show: what the backend says, or PC when Steam lists a desktop platform. */
export function systemsOf(game: GameDetails): GameSystem[] {
  if (game.availableOn?.length) return game.availableOn;
  const p = game.platforms;
  return p.windows || p.mac || p.linux ? ['PC'] : [];
}

export function systemLabel(system: GameSystem): string {
  return SYSTEM_LABELS[system];
}

/** Store feature names in one group, e.g. PLAYER_MODE → "Single-player, Online Co-op". */
export function featureNames(game: GameDetails, group: string): string[] {
  return game.allFeatures.filter((f) => f.group === group).map((f) => f.name);
}
