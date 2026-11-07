/**
 * One sync call. Only a limited number of new games are imported per call: while gamesPending is above 0,
 * syncing again continues with the rest.
 */
export interface SyncResult {
  gamesSynced: number;
  gamesSkipped: number;
  unlocksRecorded: number;
  gamesPending: number;
}
