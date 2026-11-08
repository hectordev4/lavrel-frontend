import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { AuthGateway } from '../app/core/auth/auth-gateway';
import { AuthUser } from '../app/core/auth/models/auth-user.model';
import { memberUser } from './test-env';

/** An AuthGateway with no Firebase: tests set the user and spy on the calls. */
@Injectable()
export class FakeAuthGateway extends AuthGateway {
  /** Emits nothing until a test reports a user (or null), like Firebase before it restores the session. */
  readonly state = new ReplaySubject<AuthUser | null>(1);
  readonly authState$ = this.state.asObservable();

  signInWithEmail = vi.fn(async () => memberUser());
  registerWithEmail = vi.fn(async () => memberUser({ emailVerified: false }));
  signInWithGoogle = vi.fn(async (): Promise<AuthUser | null> => memberUser({ provider: 'google' }));
  sendVerificationEmail = vi.fn(async () => undefined);
  sendPasswordReset = vi.fn(async () => undefined);
  reloadUser = vi.fn(async (): Promise<AuthUser | null> => memberUser());
  idToken = vi.fn(async (): Promise<string | null> => 'token-123');
  signOut = vi.fn(async () => undefined);
}
