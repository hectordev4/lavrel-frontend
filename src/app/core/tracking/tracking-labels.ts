import { TrackingStatus } from '../api/models/tracking-status.model';

/** Words people see for each tracking status, in the order lists show them. */
export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  PLAYING: 'Playing',
  BACKLOG: 'Backlog',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

export const TRACKING_STATUSES = Object.keys(TRACKING_STATUS_LABELS) as TrackingStatus[];
