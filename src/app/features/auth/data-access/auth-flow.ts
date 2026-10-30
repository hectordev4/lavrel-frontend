import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGateway } from '../../../core/auth/auth-gateway';
import { AuthSession } from '../../../core/auth/auth-session';
import { AuthUser } from '../../../core/auth/auth-user';
import { AuthStore } from '../../../core/auth/auth.store';
import { messageFor } from './auth-messages';

export type AuthTask = 'google' | 'email' | 'register' | 'reset' | 'resend' | 'check' | 'sign-out';

/**
 * Facade for the auth feature: runs one task at a time, exposes busy/error/notice
 * as signals for the pages, and decides where to go once a step succeeds.
 */
@Injectable({ providedIn: 'root' })
export class AuthFlow {
  private readonly gateway = inject(AuthGateway);
  private readonly store = inject(AuthStore);
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  private readonly _busy = signal<AuthTask | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _notice = signal<string | null>(null);

  readonly busy = this._busy.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notice = this._notice.asReadonly();

  clearMessages(): void {
    this._error.set(null);
    this._notice.set(null);
  }

  signInWithGoogle(): Promise<void> {
    return this.run('google', async () => {
      const user = await this.gateway.signInWithGoogle();
      if (user) await this.enter(user); // null: the browser is redirecting to Google
    });
  }

  signInWithEmail(email: string, password: string): Promise<void> {
    return this.run('email', async () => this.enter(await this.gateway.signInWithEmail(email, password)));
  }

  register(email: string, password: string): Promise<void> {
    return this.run('register', async () => {
      const user = await this.gateway.registerWithEmail(email, password);
      await this.gateway.sendVerificationEmail();
      await this.enter(user);
    });
  }

  sendPasswordReset(email: string): Promise<void> {
    return this.run('reset', async () => {
      await this.gateway.sendPasswordReset(email);
      // Same answer whether or not the account exists, so nobody can probe for e-mails.
      this._notice.set(`If ${email} has a Lavrel account, a reset link is on its way.`);
    });
  }

  resendVerification(): Promise<void> {
    return this.run('resend', async () => {
      await this.gateway.sendVerificationEmail();
      this._notice.set('Sent. Give it a minute and check your spam folder too.');
    });
  }

  /** After the person clicked the link in the e-mail. */
  checkVerified(): Promise<void> {
    return this.run('check', async () => {
      const user = await this.gateway.reloadUser();
      if (!user?.emailVerified) {
        this._error.set('Not verified yet. Open the link in the e-mail we sent, then tap this again.');
        return;
      }
      await this.gateway.idToken(true); // new token carries email_verified=true for the backend
      await this.enter(user);
    });
  }

  /** "Use a different account" on the verify page: same sign-out, with this feature's busy and error state. */
  signOut(): Promise<void> {
    return this.run('sign-out', () => this.session.signOut());
  }

  private async enter(user: AuthUser): Promise<void> {
    this.store.set(user);
    await this.router.navigateByUrl(user.emailVerified ? '/home' : '/verify-email');
  }

  private async run(task: AuthTask, work: () => Promise<void>): Promise<void> {
    if (this._busy()) return;
    this.clearMessages();
    this._busy.set(task);
    try {
      await work();
    } catch (error) {
      this._error.set(messageFor(error));
    } finally {
      this._busy.set(null);
    }
  }
}
