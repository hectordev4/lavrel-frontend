import { AuthError } from '../../../core/auth/auth-error';
import { messageFor } from './auth-messages';

describe('messageFor', () => {
  it('explains wrong credentials and a taken e-mail', () => {
    expect(messageFor(new AuthError('invalid-credentials'))).toContain('don’t match');
    expect(messageFor(new AuthError('email-in-use'))).toContain('already an account');
  });

  it('says nothing when the person closed the Google window', () => {
    expect(messageFor(new AuthError('cancelled'))).toBeNull();
  });

  it('treats anything else as unknown', () => {
    expect(messageFor(new Error('x'))).toContain('Something went wrong');
  });
});
