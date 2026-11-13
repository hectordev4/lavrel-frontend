import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when a search call fails. */
export function searchErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'Can’t reach Lavrel right now. Check your connection, then try again.';
    if (error.status === 429)
      return 'Too many searches at once. Wait a few seconds, then try again.';
  }
  return 'Search didn’t work this time. Try again in a moment.';
}
