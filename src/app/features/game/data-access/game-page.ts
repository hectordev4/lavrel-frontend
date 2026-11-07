import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { GamePageState } from '../models/game-page-state.model';
import { GameDetailsApi } from './game-details.api';
import { gameLoadMessage } from './game-messages';

/** Loads one game by slug for the game page. Provided by the page. */
@Injectable()
export class GamePage {
  private readonly api = inject(GameDetailsApi);
  private request: Subscription | null = null;
  private slug: string | null = null;

  readonly state = signal<GamePageState>({ kind: 'loading' });

  load(slug: string): void {
    this.slug = slug;
    this.request?.unsubscribe();
    this.state.set({ kind: 'loading' });
    this.request = this.api.bySlug(slug).subscribe({
      next: (game) => this.state.set({ kind: 'ready', game }),
      error: (error: unknown) =>
        this.state.set(
          error instanceof HttpErrorResponse && error.status === 404
            ? { kind: 'not-found' }
            : { kind: 'error', message: gameLoadMessage(error) },
        ),
    });
  }

  retry(): void {
    if (this.slug !== null) this.load(this.slug);
  }
}
