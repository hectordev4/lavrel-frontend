import { HttpErrorResponse } from '@angular/common/http';
import { collectionErrorMessage } from './collection-messages';

const error = (status: number, code?: string) => new HttpErrorResponse({ status, error: code ? { error: code } : null });

describe('collectionErrorMessage', () => {
  it.each([
    ['collection_name_taken', 'already have a collection'],
    ['collection_limit_reached', '50 collections'],
    ['game_not_owned', 'Only games in your library'],
  ])('explains %s', (code, text) => {
    expect(collectionErrorMessage(error(409, code))).toContain(text);
  });
});
