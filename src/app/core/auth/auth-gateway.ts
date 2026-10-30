import { Observable } from 'rxjs';
import { AuthUser } from './auth-user';

/**
 * Port for the identity provider. The app depends on this, never on Firebase directly,
 * so the provider can be swapped or faked in tests. Every method rejects with AuthError.
 */
export abstract class AuthGateway {
  /** Emits the current user (or null) once on subscribe and on every change. */
  abstract readonly authState$: Observable<AuthUser | null>;

  abstract signInWithEmail(email: string, password: string): Promise<AuthUser>;
  abstract registerWithEmail(email: string, password: string): Promise<AuthUser>;
  /** Resolves with the user, or null when the browser was sent to a redirect instead of a popup. */
  abstract signInWithGoogle(): Promise<AuthUser | null>;
  abstract sendVerificationEmail(): Promise<void>;
  abstract sendPasswordReset(email: string): Promise<void>;
  /** Re-reads the user from the provider, e.g. after they clicked the verification link. */
  abstract reloadUser(): Promise<AuthUser | null>;
  /** Firebase ID token for the API. forceRefresh picks up a just-changed email_verified claim. */
  abstract idToken(forceRefresh?: boolean): Promise<string | null>;
  abstract signOut(): Promise<void>;
}
