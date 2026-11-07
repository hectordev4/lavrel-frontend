import { Injectable, inject, signal } from '@angular/core';
import { LibraryApi } from '../../../core/api/library.api';
import { AlmostThereState } from '../models/almost-there-state.model';

const SHOWN = 8;

/** Owned games with the highest share unlocked, short of 100%. Provided by the Home page. */
@Injectable()
export class AlmostThere {
  private readonly api = inject(LibraryApi);

  readonly state = signal<AlmostThereState>({ kind: 'loading' });

  load(): void {
    this.state.set({ kind: 'loading' });
    this.api.list({ sort: 'progress', size: 48 }).subscribe({
      next: (page) =>
        this.state.set({
          kind: 'ready',
          games: page.games.filter((g) => g.total > 0 && g.unlocked > 0 && g.unlocked < g.total).slice(0, SHOWN),
        }),
      error: () => this.state.set({ kind: 'error' }),
    });
  }
}
