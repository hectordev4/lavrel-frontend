/** Every way an auth action can fail, independent of the identity provider. */
export type AuthErrorCode =
  | 'invalid-credentials'
  | 'invalid-email'
  | 'email-in-use'
  | 'weak-password'
  | 'cancelled'
  | 'popup-blocked'
  | 'account-exists-with-other-provider'
  | 'too-many-requests'
  | 'network'
  | 'unknown';
