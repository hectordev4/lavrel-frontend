import { HttpErrorResponse } from '@angular/common/http';
import { linkErrorMessage, platformErrorMessage } from './platform-messages';

describe('platform messages', () => {
  it('explains a private Steam profile', () => {
    const e = new HttpErrorResponse({ status: 422, error: { error: 'profile_private' } });
    expect(platformErrorMessage(e)).toContain('privacy settings');
  });

  it('explains Steam being down', () => {
    expect(platformErrorMessage(new HttpErrorResponse({ status: 502 }))).toContain('Steam isn’t answering');
  });

  it('explains a Steam account linked elsewhere', () => {
    expect(linkErrorMessage('account_already_linked')).toContain('linked to another Lavrel account');
    expect(linkErrorMessage('account_linked_elsewhere')).toContain('unlink it there');
    expect(linkErrorMessage(null)).toContain('didn’t confirm');
  });
});
