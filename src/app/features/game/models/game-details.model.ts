import { GameSystem } from '../../../core/api/models/game-system.model';

/** GET /api/games/{id}: everything the game page shows. Fields Steam doesn't provide are null. */
export interface GameDetails {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  description: string | null;
  storeUrl: string | null;
  releaseDate: string | null;
  platforms: GamePlatforms;
  reviews: GameReviews;
  free: boolean;
  requiredAge: number | null;
  developers: string[];
  publishers: string[];
  franchises: string[];
  /** Most applied first. */
  tags: GameTag[];
  genres: GameGenre[];
  features: Record<string, boolean>;
  accessibilityFeatureCount: number;
  allFeatures: GameFeature[];
  availableOn?: GameSystem[];
}

export interface GamePlatforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface GameReviews {
  count: number | null;
  percentPositive: number | null;
}

export interface GameTag {
  id: number;
  name: string;
  weight: number;
}

export interface GameGenre {
  id: number;
  name: string;
}

/** A Steam store category, grouped as PLAYER_MODE, FEATURE, ACCESSIBILITY or CONTROLLER. */
export interface GameFeature {
  id: number;
  name: string;
  group: 'PLAYER_MODE' | 'FEATURE' | 'ACCESSIBILITY' | 'CONTROLLER' | string;
}
