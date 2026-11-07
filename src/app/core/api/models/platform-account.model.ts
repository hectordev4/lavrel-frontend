import { Platform } from './platform.model';

/** A linked platform account, addressed by platform + externalId. lastSyncedAt is null until the first sync. */
export interface PlatformAccount {
  platform: Platform;
  externalId: string;
  displayName: string | null;
  lastSyncedAt: string | null;
}
