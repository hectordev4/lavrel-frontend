import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { FilterOption } from '../models/filter-option.model';

/**
 * The options behind one type-ahead field: waits for a pause in typing, then asks the API.
 * Create it inside a component's constructor (it needs the component's DestroyRef).
 */
export class OptionSearch {
  private readonly typed = new Subject<string>();

  readonly options = signal<FilterOption[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);

  constructor(fetch: (query: string) => Observable<FilterOption[]>, destroyRef: DestroyRef) {
    this.typed
      .pipe(
        map((text) => text.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap((query) =>
          fetch(query).pipe(
            catchError(() => {
              this.failed.set(true);
              return of<FilterOption[]>([]);
            }),
          ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((options) => {
        this.loading.set(false);
        this.options.set(options.slice(0, 8));
      });
  }

  search(text: string): void {
    this.typed.next(text);
  }
}
