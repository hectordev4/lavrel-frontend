import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when a tracking action fails. */
export function trackingErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'quick_access_full') return 'Home already has 20 pinned games. Unpin one first.';
    if (code === 'game_not_tracked')
      return 'That game isn’t in your list anymore. Refresh to see the latest.';
    if (error.status === 0)
      return 'Can’t reach Lavrel right now. Check your connection, then try again.';
    if (error.status === 429)
      return 'Too many changes at once. Wait a few seconds, then try again.';
  }
  return 'That didn’t save. Try again in a moment.';
}
