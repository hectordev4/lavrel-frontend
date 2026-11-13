import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { LibraryApi } from '../../../core/api/library.api';
import { AlmostThereState } from '../models/almost-there-state.model';

const SHOWN = 8;

/**
 * Owned games with the highest share unlocked, short of 100%. Provided by the Home page. Each load cancels
 * the one still running, so a late answer from an earlier sync never replaces a newer one.
 */
@Injectable()
export class AlmostThere {
  private readonly api = inject(LibraryApi);
  private readonly loads = new Subject<void>();

  readonly state = signal<AlmostThereState>({ kind: 'loading' });

  constructor() {
    this.loads
      .pipe(
        switchMap(() =>
          this.api.list({ sort: 'progress', size: 48 }).pipe(
            map(
              (page): AlmostThereState => ({
                kind: 'ready',
                games: page.games.filter((g) => g.total > 0 && g.unlocked > 0 && g.unlocked < g.total).slice(0, SHOWN),
              }),
            ),
            catchError(() => of<AlmostThereState>({ kind: 'error' })),
            startWith<AlmostThereState>({ kind: 'loading' }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  load(): void {
    this.loads.next();
  }
}
