import { signOutMessage } from './sign-out-reason';

describe('signOutMessage', () => {
  it('has a text for each reason the app sends', () => {
    expect(signOutMessage('session_expired')).toBe(
      'Your session has expired. Please sign in again.',
    );
    expect(signOutMessage('signed_out')).toBe('You’ve been signed out. Please sign in again.');
  });

  it('shows nothing for a missing or made-up reason', () => {
    expect(signOutMessage(null)).toBeNull();
    expect(signOutMessage(undefined)).toBeNull();
    expect(signOutMessage('')).toBeNull();
    expect(signOutMessage('<b>hacked</b>')).toBeNull();
    expect(signOutMessage('toString')).toBeNull();
  });
});
