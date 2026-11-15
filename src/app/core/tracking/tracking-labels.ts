import { TrackingStatus } from '../api/models/tracking-status.model';

/** Words people see for each tracking status, in the order lists show them. */
export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  PLAYING: 'Playing',
  BACKLOG: 'Backlog',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

export const TRACKING_STATUSES = Object.keys(TRACKING_STATUS_LABELS) as TrackingStatus[];

/** True for a real tracking status, so a value read from the page can be trusted. */
export function isTrackingStatus(value: string): value is TrackingStatus {
  return value in TRACKING_STATUS_LABELS;
}
