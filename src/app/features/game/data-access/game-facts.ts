import { GameSystem } from '../../../core/api/models/game-system.model';
import { GameDetails } from '../models/game-details.model';

const SYSTEM_LABELS: Record<GameSystem, string> = {
  PC: 'PC',
  XBOX: 'Xbox',
  PLAYSTATION: 'PlayStation',
};

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

/** One line of the game page's Details list. */
export interface DetailRow {
  label: string;
  value: string;
}

/** The Details list: developer, publisher, franchise, price, systems and store features; empty lines left out. */
export function detailRows(game: GameDetails): DetailRow[] {
  const rows: DetailRow[] = [
    {
      label: game.developers.length > 1 ? 'Developers' : 'Developer',
      value: game.developers.join(', '),
    },
    {
      label: game.publishers.length > 1 ? 'Publishers' : 'Publisher',
      value: game.publishers.join(', '),
    },
    { label: 'Franchise', value: game.franchises.join(', ') },
    { label: 'Price', value: game.free ? 'Free to play' : 'Paid' },
    { label: 'Available on', value: systemsOf(game).map(systemLabel).join(', ') },
    { label: 'Player modes', value: featureNames(game, 'PLAYER_MODE').join(', ') },
    { label: 'Controller', value: featureNames(game, 'CONTROLLER').join(', ') },
    { label: 'Accessibility', value: featureNames(game, 'ACCESSIBILITY').join(', ') },
  ];
  return rows.filter((row) => row.value);
}
