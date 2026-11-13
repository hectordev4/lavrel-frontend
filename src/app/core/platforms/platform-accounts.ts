import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccountsApi } from '../api/accounts.api';
import { Platform } from '../api/models/platform.model';
import { PlatformAccount } from '../api/models/platform-account.model';
import { AuthStore } from '../auth/auth.store';
import { TrackedGames } from '../tracking/tracked-games';
import { linkErrorMessage, platformErrorMessage } from './platform-messages';

/** Calls in one "Sync now": each imports a limited number of new games. */
const MAX_SYNC_ROUNDS = 10;

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/** Progress of a running sync, for the UI. */
export interface SyncProgress {
  gamesSynced: number;
  gamesPending: number;
}

/**
 * The member's linked accounts, shared by Home and Profile: loading them, sending the browser to the
 * platform login to link one, and syncing (repeating while games are pending). After a sync the tracked
 * games reload, because their progress changed, and syncVersion goes up so other lists can reload too.
 */
@Injectable({ providedIn: 'root' })
export class PlatformAccounts {
  private readonly api = inject(AccountsApi);
  private readonly auth = inject(AuthStore);
  private readonly tracked = inject(TrackedGames);

  private readonly _accounts = signal<PlatformAccount[]>([]);
  private readonly _loadState = signal<LoadState>('idle');
  private readonly _syncing = signal<SyncProgress | null>(null);
  private readonly _message = signal<string | null>(null);
  private readonly _syncVersion = signal(0);
  private readonly _linking = signal(false);

  readonly accounts = this._accounts.asReadonly();
  readonly loadState = this._loadState.asReadonly();
  readonly syncing = this._syncing.asReadonly();
  readonly message = this._message.asReadonly();
  /** Goes up after every finished sync. */
  readonly syncVersion = this._syncVersion.asReadonly();
  /** True while asking for the platform's login address (buttons stay disabled, no double login). */
  readonly linking = this._linking.asReadonly();
  readonly steam = computed(() => this._accounts().find((a) => a.platform === 'STEAM') ?? null);

  constructor() {
    effect(() => {
      if (!this.auth.isVerified()) {
        this._accounts.set([]);
        this._loadState.set('idle');
      }
    });
  }

  ensureLoaded(): void {
    if (this.auth.isVerified() && (this._loadState() === 'idle' || this._loadState() === 'error')) void this.reload();
  }

  async reload(): Promise<void> {
    this._loadState.set('loading');
    try {
      this._accounts.set(await firstValueFrom(this.api.list()));
      this._loadState.set('ready');
    } catch {
      this._loadState.set('error');
    }
  }

  /**
   * What every "Connect Steam" button calls. It first checks the accounts again: if Steam is already linked to
   * this member (another tab, a stale screen, a sync that failed after linking), it syncs instead of logging in
   * again. Only without a linked account does it send the browser to the platform's login (back on /steam/linked).
   */
  async connect(platform: Platform): Promise<void> {
    if (this._linking() || this._syncing()) return;
    this._message.set(null);
    this._linking.set(true);
    try {
      await this.reload();
      const linked = this._accounts().find((a) => a.platform === platform);
      if (linked) {
        this._linking.set(false);
        await this.sync(linked);
        return;
      }
      window.location.assign(await firstValueFrom(this.api.linkUrl(platform)));
    } catch (error) {
      this._message.set(platformErrorMessage(error));
    } finally {
      this._linking.set(false);
    }
  }

  /** Syncs one account, calling again while games are pending (up to a limit). Resolves true on success. */
  async sync(account: PlatformAccount): Promise<boolean> {
    if (this._syncing()) return false;
    this._message.set(null);
    this._syncing.set({ gamesSynced: 0, gamesPending: 0 });
    try {
      for (let round = 0; round < MAX_SYNC_ROUNDS; round++) {
        const result = await firstValueFrom(this.api.sync(account));
        const before = this._syncing() ?? { gamesSynced: 0, gamesPending: 0 };
        this._syncing.set({ gamesSynced: Math.max(before.gamesSynced, result.gamesSynced), gamesPending: result.gamesPending });
        if (result.gamesPending === 0) break;
      }
      const left = this._syncing()?.gamesPending ?? 0;
      if (left > 0) this._message.set(`${left} games are still waiting. Sync again to bring them in.`);
      await Promise.all([this.reload(), this.tracked.reload()]);
      this._syncVersion.update((v) => v + 1);
      return true;
    } catch (error) {
      this._message.set(platformErrorMessage(error));
      return false;
    } finally {
      this._syncing.set(null);
    }
  }

  /** Unlinks an account, then reloads the accounts and the tracked games. Resolves true on success. */
  async unlink(account: PlatformAccount): Promise<boolean> {
    this._message.set(null);
    try {
      await firstValueFrom(this.api.unlink(account));
      await Promise.all([this.reload(), this.tracked.reload()]);
      this._syncVersion.update((v) => v + 1);
      return true;
    } catch (error) {
      this._message.set(platformErrorMessage(error));
      return false;
    }
  }

  /** For the page the platform login returns to. */
  linkFailed(reason: string | null): void {
    this._message.set(linkErrorMessage(reason));
  }

  clearMessage(): void {
    this._message.set(null);
  }
}
