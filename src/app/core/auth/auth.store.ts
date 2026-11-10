import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthGateway } from './auth-gateway';
import { AuthStatus } from './models/auth-status.model';
import { AuthUser } from './models/auth-user.model';

/** App-wide auth state as signals. Features read from here and act through their own facades. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly gateway = inject(AuthGateway);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _status = signal<AuthStatus>('unknown');
  private resolveReady!: (user: AuthUser | null) => void;
  private readonly readyPromise = new Promise<AuthUser | null>((resolve) => (this.resolveReady = resolve));

  readonly user = this._user.asReadonly();
  readonly status = this._status.asReadonly();
  readonly isVerified = computed(() => this._user()?.emailVerified ?? false);

  constructor() {
    this.gateway.authState$.subscribe({
      next: (user) => this.set(user),
      error: () => this.set(null),
    });
  }

  /** Resolves once Firebase has restored (or not) the session from the last visit. */
  ready(): Promise<AuthUser | null> {
    return this.readyPromise;
  }

  /** Lets flows publish a user they just got, without waiting for onAuthStateChanged. */
  set(user: AuthUser | null): void {
    this._user.set(user);
    this._status.set(user ? 'signed-in' : 'signed-out');
    this.resolveReady(user);
  }
}
