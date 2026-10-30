import { AuthError, AuthErrorCode } from '../../../core/auth/auth-user';

/** What to tell the person, per failure. Says what happened and what to do next. */
const MESSAGES: Record<AuthErrorCode, string | null> = {
  'invalid-credentials': 'That e-mail and password don’t match an account. Check both and try again.',
  'invalid-email': 'Enter a valid e-mail address, like name@example.com.',
  'email-in-use': 'There’s already an account with this e-mail. Sign in instead, or reset the password.',
  'weak-password': 'Use at least 8 characters for your password.',
  cancelled: null, // closing the Google window is a choice, not an error
  'popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for Lavrel and try again.',
  'account-exists-with-other-provider': 'This e-mail already signs in another way. Use that method instead.',
  'too-many-requests': 'Too many attempts. Wait a minute, then try again.',
  network: 'No connection. Check your internet and try again.',
  unknown: 'Something went wrong on our side. Try again in a moment.',
};

export function messageFor(error: unknown): string | null {
  return MESSAGES[error instanceof AuthError ? error.code : 'unknown'];
}
