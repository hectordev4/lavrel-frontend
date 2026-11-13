import { LibraryPage } from '../../../core/api/models/library-page.model';
import { LibraryParams } from '../../../core/api/models/library-params.model';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { LibraryApi } from '../../../core/api/library.api';
import { LibraryQuery } from '../models/library-query.model';
import { LibraryState } from '../models/library-state.model';
import { libraryErrorMessage } from './library-messages';

const PAGE_SIZE = 48;

/** My library, a page at a time. Provided by the library page. */
@Injectable()
export class MyLibrary {
  private readonly api = inject(LibraryApi);
  /** Each page asked for; a newer query or page cancels the one still loading. */
  private readonly fetches = new Subject<{
    params: LibraryParams;
    page: number;
    append: boolean;
  }>();
  private page = 0;

  readonly query = signal<LibraryQuery>({ q: '', sort: 'recent', collection: null });
  readonly state = signal<LibraryState>({ kind: 'loading' });

  constructor() {
    this.fetches
      .pipe(
        switchMap((req) =>
          this.api.list(req.params).pipe(
            map((result) => ({ req, result, error: null as unknown })),
            catchError((error: unknown) => of({ req, result: null, error })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ req, result, error }) => this.apply(req.page, req.append, result, error));
  }

  setQuery(change: Partial<LibraryQuery>): void {
    this.query.update((q) => ({ ...q, ...change }));
    this.reload();
  }

  reload(): void {
    this.page = 0;
    this.state.set({ kind: 'loading' });
    this.fetch(0, false);
  }

  loadMore(): void {
    const s = this.state();
    if (s.kind !== 'ready' || !s.hasMore || s.loadingMore) return;
    this.state.set({ ...s, loadingMore: true, moreError: null });
    this.fetch(this.page + 1, true);
  }

  private fetch(page: number, append: boolean): void {
    const q = this.query();
    const params: LibraryParams = {
      q: q.q.trim().length >= 2 ? q.q : undefined,
      sort: q.sort,
      collection: q.collection ?? undefined,
      page,
      size: PAGE_SIZE,
    };
    this.fetches.next({ params, page, append });
  }

  private apply(page: number, append: boolean, result: LibraryPage | null, error: unknown): void {
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
      this.state.set({ ...before, loadingMore: false, moreError: libraryErrorMessage(error) });
    } else {
      this.state.set({ kind: 'error', message: libraryErrorMessage(error) });
    }
  }
}
