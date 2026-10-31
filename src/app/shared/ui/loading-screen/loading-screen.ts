import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CubeLogo } from '../cube-logo/cube-logo';
import { CubeLogoMode } from '../cube-logo/models/cube-logo-mode.model';

/**
 * Full-screen loading page: the cube L with the light chasing through it.
 * Used for the app boot (mode "boot") and while a sign-in is finishing.
 */
@Component({
  selector: 'app-loading-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  template: `
    <div class="stage" role="status" aria-live="polite">
      <app-cube-logo [mode]="mode()" label="" />
      <p class="message" [class.hidden]="!message()">{{ message() || 'Loading' }}</p>
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: grid;
      place-items: center;
      background: var(--ink);
      padding: env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px);
    }

    .stage {
      display: grid;
      justify-items: center;
      gap: 1.75rem;
    }

    app-cube-logo {
      height: 7.5rem;
      width: 4rem;
    }

    .message {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--muted);
      min-height: 1.4em;
    }

    .hidden {
      color: transparent;
    }
  `,
})
export class LoadingScreen {
  readonly mode = input<CubeLogoMode>('loading');
  readonly message = input<string>('');
}
