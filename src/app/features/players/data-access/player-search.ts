import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { PlayerSearchState } from '../models/player-search-state.model';
import { PlayersApi } from './players.api';

/**
 * Finds public profiles by name, or by player id typed with or without its spaces ("4829 1037 5521 0846").
 * Waits for a pause in typing. Provided by the players page.
 */
@Injectable()
export class PlayerSearch {
  private readonly api = inject(PlayersApi);
  private readonly typed = new Subject<string>();

  readonly state = signal<PlayerSearchState>({ kind: 'idle' });

  constructor() {
    this.typed
      .pipe(
        map(normalize),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) return of<PlayerSearchState>({ kind: 'idle' });
          return this.api.search(query).pipe(
            map((players): PlayerSearchState => ({ kind: 'ready', query, players })),
            catchError(() => of<PlayerSearchState>({ kind: 'error', query })),
            startWith<PlayerSearchState>({ kind: 'loading', query }),
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

/** Trims, and turns a spaced player id back into its 16 digits. */
export function normalize(text: string): string {
  const trimmed = text.trim();
  return /^[\d\s]+$/.test(trimmed) ? trimmed.replace(/\s+/g, '') : trimmed;
}
