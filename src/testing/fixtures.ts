import { Achievement } from '../app/features/game/models/achievement.model';
import { GameDetails } from '../app/features/game/models/game-details.model';

/** A complete game page response. */
export function gameDetails(overrides: Partial<GameDetails> = {}): GameDetails {
  return {
    id: 7,
    title: 'Rogue Harbor',
    slug: 'rogue-harbor',
    coverImageUrl: null,
    description: 'Sail a procedurally generated archipelago.',
    storeUrl: 'https://store.steampowered.com/app/7',
    releaseDate: '2025-03-14',
    platforms: { windows: true, mac: false, linux: false },
    reviews: { count: 12480, percentPositive: 94 },
    free: false,
    requiredAge: null,
    developers: ['Saltglass Studio'],
    publishers: ['Brightwake Games'],
    franchises: ['Rogue Harbor'],
    tags: [{ id: 1716, name: 'Roguelike', weight: 100 }],
    genres: [{ id: 1, name: 'Action' }],
    features: {},
    accessibilityFeatureCount: 0,
    allFeatures: [
      { id: 2, name: 'Single-player', group: 'PLAYER_MODE' },
      { id: 28, name: 'Full controller support', group: 'CONTROLLER' },
    ],
    ...overrides,
  };
}

export function achievement(id: number, overrides: Partial<Achievement> = {}): Achievement {
  return {
    id,
    name: `Achievement ${id}`,
    description: 'Do a thing.',
    iconUrl: null,
    hidden: false,
    globalPercent: 50,
    countryPercent: null,
    unlocked: false,
    unlockedAt: null,
    ...overrides,
  };
}
