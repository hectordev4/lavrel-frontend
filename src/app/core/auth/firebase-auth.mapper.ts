import { FirebaseError } from 'firebase/app';
import { User } from 'firebase/auth';
import { AuthError } from './auth-error';
import { AuthErrorCode } from './models/auth-error-code.model';
import { AuthUser } from './models/auth-user.model';

/** Translates Firebase types into the app's own. Kept apart from the gateway so the mapping is tested on its own. */

export function toAuthUser(user: User): AuthUser {
  const providerIds = user.providerData.map((p) => p.providerId);
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    provider: providerIds.includes('google.com') ? 'google' : providerIds.includes('password') ? 'password' : 'other',
  };
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  const code = error instanceof FirebaseError ? FIREBASE_CODES[error.code] : undefined;
  return new AuthError(code ?? 'unknown', error);
}

const FIREBASE_CODES: Record<string, AuthErrorCode> = {
  'auth/invalid-credential': 'invalid-credentials',
  'auth/invalid-login-credentials': 'invalid-credentials',
  'auth/wrong-password': 'invalid-credentials',
  'auth/user-not-found': 'invalid-credentials',
  'auth/user-disabled': 'invalid-credentials',
  'auth/invalid-email': 'invalid-email',
  'auth/missing-email': 'invalid-email',
  'auth/email-already-in-use': 'email-in-use',
  'auth/weak-password': 'weak-password',
  'auth/password-does-not-meet-requirements': 'weak-password',
  'auth/popup-closed-by-user': 'cancelled',
  'auth/cancelled-popup-request': 'cancelled',
  'auth/user-cancelled': 'cancelled',
  'auth/popup-blocked': 'popup-blocked',
  'auth/account-exists-with-different-credential': 'account-exists-with-other-provider',
  'auth/too-many-requests': 'too-many-requests',
  'auth/network-request-failed': 'network',
};
