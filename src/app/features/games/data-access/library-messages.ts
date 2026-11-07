import { HttpErrorResponse } from '@angular/common/http';

export function libraryErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'Your library didn’t load. Try again in a moment.';
}
