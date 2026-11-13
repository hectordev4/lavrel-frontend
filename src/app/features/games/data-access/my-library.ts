import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LibraryApi } from '../../../core/api/library.api';
import { LibraryQuery } from '../models/library-query.model';
import { LibraryState } from '../models/library-state.model';
import { libraryErrorMessage } from './library-messages';

const PAGE_SIZE = 48;

/** My library, a page at a time. Provided by the library page. */
@Injectable()
export class MyLibrary {
  private readonly api = inject(LibraryApi);
  private request: Subscription | null = null;
  private page = 0;

  readonly query = signal<LibraryQuery>({ q: '', sort: 'recent', collection: null });
  readonly state = signal<LibraryState>({ kind: 'loading' });

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
    this.request?.unsubscribe();
    this.request = this.api
      .list({
        q: q.q.trim().length >= 2 ? q.q : undefined,
        sort: q.sort,
        collection: q.collection ?? undefined,
        page,
        size: PAGE_SIZE,
      })
      .subscribe({
        next: (result) => {
          this.page = page;
          const before = this.state();
          const games =
            append && before.kind === 'ready' ? [...before.games, ...result.games] : result.games;
          this.state.set({
            kind: 'ready',
            games,
            hasMore: result.hasMore,
            loadingMore: false,
            moreError: null,
          });
        },
        error: (error: unknown) => {
          const before = this.state();
          if (append && before.kind === 'ready') {
            this.state.set({
              ...before,
              loadingMore: false,
              moreError: libraryErrorMessage(error),
            });
          } else {
            this.state.set({ kind: 'error', message: libraryErrorMessage(error) });
          }
        },
      });
  }
}
