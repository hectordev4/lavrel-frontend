import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurrentUserApi } from '../api/current-user.api';
import { CurrentUser } from '../api/models/current-user.model';
import { AuthStore } from '../auth/auth.store';

/**
 * The first-time setup (name, avatar, country). The backend decides who gets it: GET /api/currentuser says
 * `setupCompleted: false` until PUT /api/currentuser/setup is called, whether the person saved or skipped.
 */
@Injectable({ providedIn: 'root' })
export class FirstSetup {
  private readonly api = inject(CurrentUserApi);
  private readonly auth = inject(AuthStore);
  /** Accounts that finished or skipped in this session, so Home never sends them back even if the PUT failed. */
  private readonly done = signal<ReadonlySet<string>>(new Set());

  /** Whether this user, as GET /api/currentuser returned it, still has the first setup to do. */
  neededFor(user: CurrentUser): boolean {
    const uid = this.auth.user()?.uid;
    return user.setupCompleted === false && !(uid && this.done().has(uid));
  }

  /**
   * Saved or skipped: tells the backend. If that call fails the person still goes on; the setup is simply offered
   * again the next time Lavrel opens.
   */
  async complete(): Promise<void> {
    const uid = this.auth.user()?.uid;
    if (uid) this.done.update((all) => new Set([...all, uid]));
    await firstValueFrom(this.api.completeSetup()).catch(() => undefined);
  }
}
