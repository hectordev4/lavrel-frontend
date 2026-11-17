import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGateway } from './auth-gateway';
import { AuthStore } from './auth.store';
import { GuestMode } from './guest-mode';
import { SignOutReason } from './sign-out-reason';

/**
 * Session actions any feature may need. Signing out lives here, not in the auth feature,
 * so profile, settings or a menu can sign out without importing another feature.
 */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly gateway = inject(AuthGateway);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly guestMode = inject(GuestMode);
  private ending: Promise<void> | null = null;

  /** Signs out, clears the state and goes back to the start page. Rejects with AuthError. */
  async signOut(): Promise<void> {
    await this.gateway.signOut();
    this.store.set(null);
    this.guestMode.clear();
    await this.router.navigateByUrl('/welcome');
  }

  /**
   * Ends a session the app can no longer use, and opens welcome with the reason. Several failing calls may ask
   * at once: they all share the first sign-out. Never rejects: if Firebase can't sign out either, the state is
   * still cleared and welcome still opens.
   */
  endSession(reason: SignOutReason): Promise<void> {
    this.ending ??= this.end(reason).finally(() => (this.ending = null));
    return this.ending;
  }

  private async end(reason: SignOutReason): Promise<void> {
    await this.gateway.signOut().catch(() => undefined);
    this.store.set(null);
    this.guestMode.clear();
    await this.router.navigateByUrl(`/welcome?reason=${reason}`);
  }
}
