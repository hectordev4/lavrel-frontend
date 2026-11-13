import { relativeTime } from './relative-time';

/** "synced 2 hours ago", or "not synced yet" before the first sync. */
export function syncedLabel(lastSyncedAt: string | null | undefined): string {
  return lastSyncedAt ? `synced ${relativeTime(lastSyncedAt)}` : 'not synced yet';
}
