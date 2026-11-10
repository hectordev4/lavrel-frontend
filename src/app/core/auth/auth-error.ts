import { AuthErrorCode } from './models/auth-error-code.model';

/** The only error type auth code throws; carries the provider's original error as cause. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    override readonly cause?: unknown,
  ) {
    super(code);
    this.name = 'AuthError';
  }
}
