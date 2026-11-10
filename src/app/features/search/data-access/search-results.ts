import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameCatalogApi } from '../../../core/api/game-catalog.api';
import { ResultsState } from '../models/results-state.model';
import { SearchFilters } from '../models/search-filters.model';
import { searchErrorMessage } from './search-messages';
import { toApiParams } from './search-query';

const PAGE_SIZE = 20;

/** Loads results for a set of filters, a page at a time. Provided by the results page. */
@Injectable()
export class SearchResults {
  private readonly api = inject(GameCatalogApi);
  private filters: SearchFilters | null = null;
  private page = 0;
  private request: Subscription | null = null;

  readonly state = signal<ResultsState>({ kind: 'loading' });

  load(filters: SearchFilters): void {
    this.filters = filters;
    this.page = 0;
    this.state.set({ kind: 'loading' });
    this.fetch(0, false);
  }

  retry(): void {
    if (this.filters) this.load(this.filters);
  }

  loadMore(): void {
    const s = this.state();
    if (s.kind !== 'ready' || !s.hasMore || s.loadingMore) return;
    this.state.set({ ...s, loadingMore: true, moreError: null });
    this.fetch(this.page + 1, true);
  }

  private fetch(page: number, append: boolean): void {
    if (!this.filters) return;
    this.request?.unsubscribe();
    this.request = this.api.search(toApiParams(this.filters, page, PAGE_SIZE)).subscribe({
      next: (result) => {
        this.page = page;
        const before = this.state();
        const games = append && before.kind === 'ready' ? [...before.games, ...result.games] : result.games;
        this.state.set({ kind: 'ready', games, hasMore: result.hasMore, loadingMore: false, moreError: null });
      },
      error: (error: unknown) => {
        const before = this.state();
        if (append && before.kind === 'ready') {
          this.state.set({ ...before, loadingMore: false, moreError: searchErrorMessage(error) });
        } else {
          this.state.set({ kind: 'error', message: searchErrorMessage(error) });
        }
      },
    });
  }
}
