import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';
import { AppBoot } from './core/boot';
import { LoadingScreen } from './shared/ui/loading-screen/loading-screen';

/** Long enough for the L to finish building, short enough not to feel like a wait. */
const MIN_SPLASH_MS = 1500;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LoadingScreen],
  template: `
    @if (booting()) {
      <app-loading-screen mode="boot" animate.leave="splash-out" />
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  private readonly store = inject(AuthStore);
  private readonly minTimePassed = signal(false);

  /** Splash until Firebase has restored the session and the build animation has played. */
  protected readonly booting = computed(() => this.store.status() === 'unknown' || !this.minTimePassed());

  constructor() {
    const boot = inject(AppBoot);
    effect(() => {
      if (!this.booting()) boot.markSplashEnded();
    });
    setTimeout(() => this.minTimePassed.set(true), MIN_SPLASH_MS);
  }
}
