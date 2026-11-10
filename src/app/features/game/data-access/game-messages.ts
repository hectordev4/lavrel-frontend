import { HttpErrorResponse } from '@angular/common/http';

export function gameLoadMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'This game didn’t load. Try again in a moment.';
}

export function achievementsLoadMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Can’t reach Lavrel right now, so the achievements didn’t load.';
  }
  return 'The achievements didn’t load. Try again in a moment.';
}
