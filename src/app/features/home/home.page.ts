import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrentUserApi } from '../../core/api/current-user.api';
import { CurrentUser } from '../../core/api/models/current-user.model';
import { AuthSession } from '../../core/auth/auth-session';
import { AuthStore } from '../../core/auth/auth.store';
import { CubeLogo } from '../../shared/ui/logo/cube-logo';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; user: CurrentUser }
  | { kind: 'error'; message: string };

/**
 * Placeholder landing after sign-in. Its real job for now: make the first
 * GET /api/currentuser call, which creates the user on the backend.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  template: `
    <main class="page home">
      @switch (state().kind) {
        @case ('loading') {
          <div class="center" role="status">
            <app-cube-logo class="mark" mode="loading" label="" />
            <p class="muted">Setting up your profile</p>
          </div>
        }
        @case ('error') {
          <div class="center">
            <app-cube-logo class="mark" mode="still" label="" />
            <p class="alert" role="alert">{{ errorMessage() }}</p>
            <button type="button" class="btn btn-secondary" (click)="load()">Try again</button>
          </div>
        }
        @case ('ready') {
          <app-cube-logo class="mark" mode="intro" label="" />
          <h1>You’re in{{ username() ? ', ' + username() : '' }}.</h1>
          <p class="muted">
            Signed in as {{ store.user()?.email }}. Next up: choosing your name and country.
          </p>
        }
      }

      <button type="button" class="link-btn sign-out" [disabled]="signingOut()" (click)="signOut()">
        Sign out
      </button>
    </main>
  `,
  styles: `
    .home {
      display: flex;
      flex-direction: column;
      padding-top: clamp(3rem, 14vh, 7rem);
    }
    .center {
      display: grid;
      justify-items: center;
      gap: 1.25rem;
      margin: auto 0;
      text-align: center;
    }
    .mark { height: 5.5rem; width: 3rem; margin-bottom: 1.5rem; }
    .center .mark { margin-bottom: 0; }
    h1 { margin: 0 0 0.5rem; font-size: 1.875rem; font-weight: 700; letter-spacing: -0.02em; }
    .muted { margin: 0; color: var(--muted); line-height: 1.55; }
    .sign-out { margin-top: auto; justify-self: center; align-self: center; }
  `,
})
export class HomePage {
  private readonly api = inject(CurrentUserApi);
  protected readonly store = inject(AuthStore);
  private readonly session = inject(AuthSession);
  protected readonly state = signal<State>({ kind: 'loading' });
  protected readonly signingOut = signal(false);

  constructor() {
    this.load();
  }

  protected username(): string | undefined {
    const s = this.state();
    return s.kind === 'ready' ? s.user.username : undefined;
  }

  protected errorMessage(): string {
    const s = this.state();
    return s.kind === 'error' ? s.message : '';
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.session.signOut();
    } finally {
      this.signingOut.set(false);
    }
  }

  protected load(): void {
    this.state.set({ kind: 'loading' });
    this.api.get().subscribe({
      next: (user) => this.state.set({ kind: 'ready', user }),
      error: (error: unknown) =>
        this.state.set({
          kind: 'error',
          message:
            error instanceof HttpErrorResponse && error.status === 0
              ? 'Can’t reach the Lavrel server. Check that the backend is running, then try again.'
              : 'Your profile didn’t load. Try again in a moment.',
        }),
    });
  }
}
