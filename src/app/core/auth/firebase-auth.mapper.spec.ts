import { FirebaseError } from 'firebase/app';
import { User } from 'firebase/auth';
import { AuthError } from './auth-error';
import { toAuthError, toAuthUser } from './firebase-auth.mapper';

function firebaseUser(providerIds: string[], emailVerified = true): User {
  return {
    uid: 'abc',
    email: 'a@b.c',
    emailVerified,
    providerData: providerIds.map((providerId) => ({ providerId })),
  } as unknown as User;
}

describe('toAuthUser', () => {
  it('keeps uid, e-mail and verification', () => {
    expect(toAuthUser(firebaseUser(['password'], false))).toEqual({
      uid: 'abc',
      email: 'a@b.c',
      emailVerified: false,
      provider: 'password',
    });
  });

  it('prefers google when several providers are linked', () => {
    expect(toAuthUser(firebaseUser(['password', 'google.com'])).provider).toBe('google');
  });

  it('reports other providers as other', () => {
    expect(toAuthUser(firebaseUser(['github.com'])).provider).toBe('other');
  });
});

describe('toAuthError', () => {
  it.each([
    ['auth/invalid-credential', 'invalid-credentials'],
    ['auth/wrong-password', 'invalid-credentials'],
    ['auth/email-already-in-use', 'email-in-use'],
    ['auth/weak-password', 'weak-password'],
    ['auth/popup-closed-by-user', 'cancelled'],
    ['auth/popup-blocked', 'popup-blocked'],
    ['auth/too-many-requests', 'too-many-requests'],
    ['auth/network-request-failed', 'network'],
  ])('maps %s to %s', (code, expected) => {
    expect(toAuthError(new FirebaseError(code, 'x')).code).toBe(expected);
  });

  it('maps unknown errors to unknown and keeps the cause', () => {
    const cause = new Error('boom');
    const error = toAuthError(cause);
    expect(error.code).toBe('unknown');
    expect(error.cause).toBe(cause);
  });

  it('passes an AuthError through unchanged', () => {
    const original = new AuthError('network');
    expect(toAuthError(original)).toBe(original);
  });
});
