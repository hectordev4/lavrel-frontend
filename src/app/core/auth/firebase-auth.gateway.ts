import { Injectable, inject } from '@angular/core';
import { FirebaseError, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
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
import { APP_ENV } from '../config/app-env.token';
import { AuthGateway } from './auth-gateway';
import { toAuthError, toAuthUser } from './firebase-auth.mapper';
import { AuthUser } from './models/auth-user.model';

/** Adapter: together with its mapper, the only place in the app that imports Firebase. */
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

/** Runs a Firebase call and turns whatever it throws into an AuthError. */
async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toAuthError(error);
  }
}
