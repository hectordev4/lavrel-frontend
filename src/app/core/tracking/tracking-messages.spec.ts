import { HttpErrorResponse } from '@angular/common/http';
import { trackingErrorMessage } from './tracking-messages';

const error = (status: number, code?: string) =>
  new HttpErrorResponse({ status, error: code ? { error: code } : null });

describe('trackingErrorMessage', () => {
  it('explains a full Home', () => {
    expect(trackingErrorMessage(error(409, 'quick_access_full'))).toContain('20 pinned games');
  });

  it('explains no connection and too many changes', () => {
    expect(trackingErrorMessage(error(0))).toContain('Can’t reach Lavrel');
    expect(trackingErrorMessage(error(429))).toContain('Too many changes');
  });

  it('falls back to a generic message', () => {
    expect(trackingErrorMessage(new Error('x'))).toBe('That didn’t save. Try again in a moment.');
  });
});
