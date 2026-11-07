import { Platform } from './platform.model';
import { TrackingStatus } from './tracking-status.model';

/**
 * A game the member owns. playtimeMinutes and lastPlayedAt add up every linked account that owns it;
 * ownedOn lists those platforms. trackingStatus is null when the game isn't tracked.
 */
export interface LibraryGame {
  gameId: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  releaseDate: string | null;
  playtimeMinutes: number;
  lastPlayedAt: string | null;
  ownedOn: Platform[];
  unlocked: number;
  total: number;
  trackingStatus: TrackingStatus | null;
  pinned: boolean;
}
