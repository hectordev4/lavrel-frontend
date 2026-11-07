import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TrackedGame } from '../api/models/tracked-game.model';
import { TrackingStatus } from '../api/models/tracking-status.model';
import { TrackingApi } from '../api/tracking.api';
import { AuthStore } from '../auth/auth.store';
import { trackingErrorMessage } from './tracking-messages';

export const MAX_PINNED = 20;

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * The member's tracked games, shared by Games, Home, the game page and search results so they always
 * agree. Loaded once on first use; cleared on sign-out. Actions resolve to an error message, or null.
 */
@Injectable({ providedIn: 'root' })
export class TrackedGames {
  private readonly api = inject(TrackingApi);
  private readonly auth = inject(AuthStore);

  private readonly _games = signal<TrackedGame[]>([]);
  private readonly _loadState = signal<LoadState>('idle');
  private readonly _busy = signal<ReadonlySet<number>>(new Set());

  readonly games = this._games.asReadonly();
  readonly loadState = this._loadState.asReadonly();
  readonly busy = this._busy.asReadonly();
  readonly byGameId = computed(() => new Map(this._games().map((g) => [g.gameId, g])));
  readonly pinned = computed(() =>
    this._games()
      .filter((g) => g.pinPosition !== null)
      .sort((a, b) => (a.pinPosition ?? 0) - (b.pinPosition ?? 0)),
  );
  readonly pinnedCount = computed(() => this.pinned().length);

  constructor() {
    effect(() => {
      if (!this.auth.isVerified()) this.reset();
    });
  }

  /** Loads the list unless it is already loaded or loading. */
  ensureLoaded(): void {
    if (this.auth.isVerified() && (this._loadState() === 'idle' || this._loadState() === 'error')) this.reload();
  }

  async reload(): Promise<void> {
    this._loadState.set('loading');
    try {
      this._games.set(await firstValueFrom(this.api.list()));
      this._loadState.set('ready');
    } catch {
      this._loadState.set('error');
    }
  }

  /** Adds the game with a status, or changes its status. */
  track(gameId: number, status: TrackingStatus): Promise<string | null> {
    return this.run(gameId, async () => {
      const card = await firstValueFrom(this.api.track(gameId, status));
      this._games.update((games) =>
        games.some((g) => g.gameId === gameId) ? games.map((g) => (g.gameId === gameId ? card : g)) : [...games, card],
      );
    });
  }

  untrack(gameId: number): Promise<string | null> {
    return this.run(gameId, async () => {
      await firstValueFrom(this.api.untrack(gameId));
      this._games.update((games) => renumberPins(games.filter((g) => g.gameId !== gameId)));
    });
  }

  pin(gameId: number): Promise<string | null> {
    if (this.pinnedCount() >= MAX_PINNED) return Promise.resolve('Home already has 20 pinned games. Unpin one first.');
    return this.run(gameId, async () => {
      const pinned = await firstValueFrom(this.api.pin(gameId));
      this.applyPins(pinned);
    });
  }

  unpin(gameId: number): Promise<string | null> {
    return this.run(gameId, async () => {
      await firstValueFrom(this.api.unpin(gameId));
      this._games.update((games) =>
        renumberPins(games.map((g) => (g.gameId === gameId ? { ...g, pinPosition: null } : g))),
      );
    });
  }

  /** New order for the pinned games (every pinned game once). */
  async reorder(gameIds: number[]): Promise<string | null> {
    try {
      this.applyPins(await firstValueFrom(this.api.reorder(gameIds)));
      return null;
    } catch (error) {
      return trackingErrorMessage(error);
    }
  }

  private applyPins(pinned: TrackedGame[]): void {
    const positions = new Map(pinned.map((g) => [g.gameId, g.pinPosition]));
    this._games.update((games) => games.map((g) => ({ ...g, pinPosition: positions.get(g.gameId) ?? null })));
  }

  private async run(gameId: number, work: () => Promise<void>): Promise<string | null> {
    if (this._busy().has(gameId)) return null;
    this._busy.update((ids) => new Set([...ids, gameId]));
    try {
      await work();
      return null;
    } catch (error) {
      return trackingErrorMessage(error);
    } finally {
      this._busy.update((ids) => new Set([...ids].filter((id) => id !== gameId)));
    }
  }

  private reset(): void {
    this._games.set([]);
    this._loadState.set('idle');
  }
}

/** Keeps pin positions 1..n without gaps, like the backend does. */
function renumberPins(games: TrackedGame[]): TrackedGame[] {
  const order = games
    .filter((g) => g.pinPosition !== null)
    .sort((a, b) => (a.pinPosition ?? 0) - (b.pinPosition ?? 0))
    .map((g) => g.gameId);
  return games.map((g) => (g.pinPosition === null ? g : { ...g, pinPosition: order.indexOf(g.gameId) + 1 }));
}
