import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { SuggestionsState } from '../models/suggestions-state.model';
import { QuickSearchApi } from './quick-search.api';
import { searchErrorMessage } from './search-messages';

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

/** Turns what the person types into grouped suggestions, waiting for a short pause between keys. */
@Injectable()
export class SearchSuggestions {
  private readonly api = inject(QuickSearchApi);
  private readonly typed = new Subject<string>();

  readonly state = signal<SuggestionsState>({ kind: 'idle' });

  constructor() {
    this.typed
      .pipe(
        map((text) => text.trim()),
        debounceTime(DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < MIN_LENGTH) return of<SuggestionsState>({ kind: 'idle' });
          return this.api.search(query).pipe(
            map((results): SuggestionsState => ({ kind: 'ready', query, results })),
            catchError((error: unknown) => of<SuggestionsState>({ kind: 'error', query, message: searchErrorMessage(error) })),
            startWith<SuggestionsState>({ kind: 'loading', query }),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((state) => this.state.set(state));
  }

  type(text: string): void {
    this.typed.next(text);
  }
}
