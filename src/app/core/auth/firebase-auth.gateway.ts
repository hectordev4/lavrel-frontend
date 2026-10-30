import { Injectable, inject } from '@angular/core';
import { FirebaseError, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { Observable, shareReplay } from 'rxjs';
import { APP_ENV } from '../config/app-env';
import { AuthGateway } from './auth-gateway';
import { AuthError, AuthErrorCode, AuthUser } from './auth-user';

/** Adapter: the only file in the app that imports firebase/auth. */
@Injectable()
export class FirebaseAuthGateway extends AuthGateway {
  private readonly auth: Auth;

  readonly authState$: Observable<AuthUser | null>;

  constructor() {
    super();
    const env = inject(APP_ENV);
    this.auth = getAuth(initializeApp(env.firebase));
    void setPersistence(this.auth, browserLocalPersistence);

    this.authState$ = new Observable<AuthUser | null>((subscriber) =>
      onAuthStateChanged(
        this.auth,
        (user) => subscriber.next(user ? toAuthUser(user) : null),
        (error) => subscriber.error(toAuthError(error)),
      ),
    ).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }

  signInWithEmail(email: string, password: string): Promise<AuthUser> {
    return run(async () => toAuthUser((await signInWithEmailAndPassword(this.auth, email, password)).user));
  }

  registerWithEmail(email: string, password: string): Promise<AuthUser> {
    return run(async () => toAuthUser((await createUserWithEmailAndPassword(this.auth, email, password)).user));
  }

  signInWithGoogle(): Promise<AuthUser | null> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return run(async () => {
      try {
        return toAuthUser((await signInWithPopup(this.auth, provider)).user);
      } catch (error) {
        // Some in-app and mobile browsers can't open popups: fall back to a full-page redirect.
        // onAuthStateChanged picks the user up when the browser comes back.
        const code = (error as FirebaseError).code;
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(this.auth, provider);
          return null;
        }
        throw error;
      }
    });
  }

  sendVerificationEmail(): Promise<void> {
    return run(async () => {
      if (this.auth.currentUser) await sendEmailVerification(this.auth.currentUser);
    });
  }

  sendPasswordReset(email: string): Promise<void> {
    return run(() => sendPasswordResetEmail(this.auth, email));
  }

  reloadUser(): Promise<AuthUser | null> {
    return run(async () => {
      const user = this.auth.currentUser;
      if (!user) return null;
      await user.reload();
      return toAuthUser(user);
    });
  }

  async idToken(forceRefresh = false): Promise<string | null> {
    await this.auth.authStateReady();
    return this.auth.currentUser ? this.auth.currentUser.getIdToken(forceRefresh) : null;
  }

  signOut(): Promise<void> {
    return run(() => signOut(this.auth));
  }
}

function toAuthUser(user: User): AuthUser {
  const providerIds = user.providerData.map((p) => p.providerId);
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    provider: providerIds.includes('google.com') ? 'google' : providerIds.includes('password') ? 'password' : 'other',
  };
}

async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toAuthError(error);
  }
}

const CODES: Record<string, AuthErrorCode> = {
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

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  const code = error instanceof FirebaseError ? CODES[error.code] : undefined;
  return new AuthError(code ?? 'unknown', error);
}
