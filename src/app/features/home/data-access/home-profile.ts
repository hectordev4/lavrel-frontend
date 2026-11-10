import { Injectable, computed, inject, signal } from '@angular/core';
import { CurrentUserApi } from '../../../core/api/current-user.api';
import { HomeState } from '../models/home-state.model';
import { profileLoadMessage } from './home-messages';

/**
 * Loads the signed-in user's profile for the home page. Its first call creates
 * the user on the backend. Provided by the page, so it lives as long as the page does.
 */
@Injectable()
export class HomeProfile {
  private readonly api = inject(CurrentUserApi);
  private readonly _state = signal<HomeState>({ kind: 'loading' });

  readonly state = this._state.asReadonly();
  readonly username = computed(() => {
    const state = this._state();
    return state.kind === 'ready' ? state.user.username : undefined;
  });
  readonly errorMessage = computed(() => {
    const state = this._state();
    return state.kind === 'error' ? state.message : '';
  });

  load(): void {
    this._state.set({ kind: 'loading' });
    this.api.get().subscribe({
      next: (user) => this._state.set({ kind: 'ready', user }),
      error: (error: unknown) => this._state.set({ kind: 'error', message: profileLoadMessage(error) }),
    });
  }
}
