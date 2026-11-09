import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { GameCatalogApi } from '../../../core/api/game-catalog.api';
import { GameCard } from '../../../core/api/models/game-card.model';

/** Finds a game to chat about, by name, after a pause in typing. Provided by the AI tab. */
@Injectable()
export class ChatGamePicker {
  private readonly api = inject(GameCatalogApi);
  private readonly typed = new Subject<string>();

  readonly results = signal<GameCard[]>([]);

  constructor() {
    this.typed
      .pipe(
        map((t) => t.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) =>
          q.length < 2
            ? of<GameCard[]>([])
            : this.api.search({ q, size: 6 }).pipe(
                map((page) => page.games),
                catchError(() => of<GameCard[]>([])),
              ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((games) => this.results.set(games));
  }

  type(text: string): void {
    this.typed.next(text);
  }
}
