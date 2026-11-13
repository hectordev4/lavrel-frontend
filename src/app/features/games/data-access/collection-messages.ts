import { HttpErrorResponse } from '@angular/common/http';

/** What to tell the person when a collection change fails. */
export function collectionErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = error.error?.error;
    if (code === 'collection_name_taken') return 'You already have a collection with that name.';
    if (code === 'collection_limit_reached')
      return 'You have 50 collections, the most allowed. Delete one first.';
    if (code === 'game_not_owned') return 'Only games in your library can go in a collection.';
    if (code === 'collection_not_found') return 'That collection doesn’t exist anymore.';
    if (error.status === 400) return 'Use between 1 and 40 characters for the name.';
    if (error.status === 0)
      return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'That didn’t save. Try again in a moment.';
}
