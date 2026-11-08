import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when a shelf change fails. */
export function shelfErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'shelf_limit_reached') return 'Your profile already has 10 shelves. Remove one first.';
    if (code === 'invalid_shelf') return error.error?.message ?? 'That shelf can’t be added.';
    if (code === 'shelf_not_found') return 'That shelf doesn’t exist anymore. Refresh to see the latest.';
    if (error.status === 0) return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'That didn’t save. Try again in a moment.';
}
