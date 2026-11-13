import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { GamePageState } from '../models/game-page-state.model';
import { GameDetailsApi } from './game-details.api';
import { gameLoadMessage } from './game-messages';

/** Loads one game by slug for the game page. Provided by the page. */
@Injectable()
export class GamePage {
  private readonly api = inject(GameDetailsApi);
  private readonly loads = new Subject<string>();
  private slug: string | null = null;

  readonly state = signal<GamePageState>({ kind: 'loading' });

  constructor() {
    // A new slug (or Try again) cancels the request still running.
    this.loads
      .pipe(
        switchMap((slug) =>
          this.api.bySlug(slug).pipe(
            map((game): GamePageState => ({ kind: 'ready', game })),
            catchError((error: unknown) =>
              of<GamePageState>(
                error instanceof HttpErrorResponse && error.status === 404
                  ? { kind: 'not-found' }
                  : { kind: 'error', message: gameLoadMessage(error) },
              ),
            ),
            startWith<GamePageState>({ kind: 'loading' }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  load(slug: string): void {
    this.slug = slug;
    this.loads.next(slug);
  }

  retry(): void {
    if (this.slug !== null) this.load(this.slug);
  }
}
