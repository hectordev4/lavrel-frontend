import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { GameCatalogApi } from '../../../core/api/game-catalog.api';
import { GameSearchParams } from '../../../core/api/models/game-search-params.model';
import { DiscoverSection } from '../models/discover-section.model';

/** Loads the discover home's lists. Provided by the page, so it lives as long as the page does. */
@Injectable()
export class Discover {
  private readonly api = inject(GameCatalogApi);

  readonly popular = signal<DiscoverSection>({ kind: 'loading' });
  readonly newest = signal<DiscoverSection>({ kind: 'loading' });

  loadAll(): void {
    this.loadPopular();
    this.loadNewest();
  }

  loadPopular(): void {
    this.load(this.popular, { sort: 'popular', size: 5 });
  }

  loadNewest(): void {
    this.load(this.newest, { sort: 'newest', size: 8 });
  }

  private load(target: WritableSignal<DiscoverSection>, params: GameSearchParams): void {
    target.set({ kind: 'loading' });
    this.api.search(params).subscribe({
      next: (page) => target.set({ kind: 'ready', games: page.games }),
      error: (error: unknown) => target.set({ kind: 'error', message: loadMessage(error) }),
    });
  }
}

function loadMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Can’t reach Lavrel right now. Check your connection, then try again.';
  }
  return 'These games didn’t load. Try again in a moment.';
}
