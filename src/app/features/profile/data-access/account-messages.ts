import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when an account change fails. */
export function accountErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'invalid_username' || (error.status === 400 && error.error?.details)) {
      return error.error?.message ?? 'That name can’t be used. Try another.';
    }
    if (code === 'username_reserved') return 'That name is reserved. Try another.';
    if (code === 'country_not_found')
      return 'That country isn’t in the list anymore. Pick another.';
    if (error.status === 0)
      return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'That didn’t save. Try again in a moment.';
}
