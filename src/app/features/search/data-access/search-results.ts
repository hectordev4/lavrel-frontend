import { GamePage } from '../../../core/api/models/game-page.model';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
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
  /** Each page asked for; a newer search or page cancels the one still loading. */
  private readonly fetches = new Subject<{
    filters: SearchFilters;
    page: number;
    append: boolean;
  }>();

  readonly state = signal<ResultsState>({ kind: 'loading' });

  constructor() {
    this.fetches
      .pipe(
        switchMap((req) =>
          this.api.search(toApiParams(req.filters, req.page, PAGE_SIZE)).pipe(
            map((result) => ({ req, result, error: null as unknown })),
            catchError((error: unknown) => of({ req, result: null, error })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ req, result, error }) => this.apply(req.page, req.append, result, error));
  }

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
    if (this.filters) this.fetches.next({ filters: this.filters, page, append });
  }

  private apply(page: number, append: boolean, result: GamePage | null, error: unknown): void {
    const before = this.state();
    if (result) {
      this.page = page;
      const games =
        append && before.kind === 'ready' ? [...before.games, ...result.games] : result.games;
      this.state.set({
        kind: 'ready',
        games,
        hasMore: result.hasMore,
        loadingMore: false,
        moreError: null,
      });
    } else if (append && before.kind === 'ready') {
      this.state.set({ ...before, loadingMore: false, moreError: searchErrorMessage(error) });
    } else {
      this.state.set({ kind: 'error', message: searchErrorMessage(error) });
    }
  }
}
