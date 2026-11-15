import { HttpErrorResponse } from '@angular/common/http';
import { profileLoadMessage } from './home-messages';

describe('home messages', () => {
  it('talks about the connection, not the server, when offline', () => {
    expect(profileLoadMessage(new HttpErrorResponse({ status: 0 }))).toBe(
      'Can’t reach Lavrel right now. Check your connection, then try again.',
    );
  });

  it('falls back to a plain retry message', () => {
    expect(profileLoadMessage(new HttpErrorResponse({ status: 500 }))).toBe(
      'Your profile didn’t load. Try again in a moment.',
    );
  });
});
