import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when their profile doesn't load. */
export function profileLoadMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Can’t reach the Lavrel server. Check that the backend is running, then try again.';
  }
  return 'Your profile didn’t load. Try again in a moment.';
}
