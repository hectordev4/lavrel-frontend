import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGateway } from './auth-gateway';
import { AuthStore } from './auth.store';

/**
 * Session actions any feature may need. Signing out lives here, not in the auth feature,
 * so profile, settings or a menu can sign out without importing another feature.
 */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly gateway = inject(AuthGateway);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  /** Signs out, clears the state and goes back to the start page. Rejects with AuthError. */
  async signOut(): Promise<void> {
    await this.gateway.signOut();
    this.store.set(null);
    await this.router.navigateByUrl('/welcome');
  }
}
