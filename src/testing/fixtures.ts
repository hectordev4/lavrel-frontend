import { LibraryGame } from '../app/core/api/models/library-game.model';
import { TrackedGame } from '../app/core/api/models/tracked-game.model';
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

export function trackedGame(gameId: number, overrides: Partial<TrackedGame> = {}): TrackedGame {
  return {
    gameId,
    title: `Game ${gameId}`,
    slug: `game-${gameId}`,
    coverImageUrl: null,
    releaseDate: '2025-01-01',
    status: 'PLAYING',
    pinPosition: null,
    unlocked: 5,
    total: 10,
    nextAchievements: [],
    addedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function libraryGame(gameId: number, overrides: Partial<LibraryGame> = {}): LibraryGame {
  return {
    gameId,
    title: `Game ${gameId}`,
    slug: `game-${gameId}`,
    coverImageUrl: null,
    releaseDate: '2025-01-01',
    playtimeMinutes: 120,
    lastPlayedAt: null,
    ownedOn: ['STEAM'],
    unlocked: 5,
    total: 10,
    trackingStatus: null,
    pinned: false,
    ...overrides,
  };
}
