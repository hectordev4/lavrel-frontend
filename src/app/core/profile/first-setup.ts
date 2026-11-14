import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

/** Accounts created within this many days are offered the first setup; older ones never are. */
const NEW_ACCOUNT_DAYS = 14;
const KEY = 'lavrel.first-setup-done.';

/**
 * Whether to offer the first-time setup (name, avatar, country) to the signed-in member: only for a new account,
 * and only until they finish or skip it on this device.
 */
@Injectable({ providedIn: 'root' })
export class FirstSetup {
  private readonly auth = inject(AuthStore);
  private readonly done = signal<ReadonlySet<string>>(new Set());

  readonly needed = computed(() => {
    const user = this.auth.user();
    if (!user?.emailVerified || !user.createdAt) return false;
    if (this.done().has(user.uid) || readDone(user.uid)) return false;
    const ageDays = (Date.now() - Date.parse(user.createdAt)) / 86_400_000;
    return ageDays <= NEW_ACCOUNT_DAYS;
  });

  /** Finished or skipped: never offered again for this account on this device. */
  markDone(): void {
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    try {
      localStorage.setItem(KEY + uid, 'true');
    } catch {
      // Private mode: it is still remembered until the page closes.
    }
    this.done.update((all) => new Set([...all, uid]));
  }
}

function readDone(uid: string): boolean {
  try {
    return localStorage.getItem(KEY + uid) === 'true';
  } catch {
    return false;
  }
}
