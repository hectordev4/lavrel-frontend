export type AuthProvider = 'password' | 'google' | 'other';

/** The signed-in person as the frontend sees them. Firebase types never leave the gateway. */
export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: AuthProvider;
}

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

export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    override readonly cause?: unknown,
  ) {
    super(code);
    this.name = 'AuthError';
  }
}
