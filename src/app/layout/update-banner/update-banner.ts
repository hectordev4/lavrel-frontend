import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppUpdates } from '../../core/pwa/app-updates';

/** A quiet line offering to reload into a newer version of Lavrel, once one is ready. */
@Component({
  selector: 'app-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (updates.ready()) {
      <p class="banner" role="status">
        A new version of Lavrel is ready.
        <button type="button" (click)="updates.reload()">Reload</button>
      </p>
    }
  `,
  styles: `
    .banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin: 0;
      padding: 0.5rem 1rem;
      background: var(--ink-raised);
      border-bottom: 1px solid var(--hairline);
      font-size: 0.875rem;
    }

    button {
      min-height: 2.75rem;
      padding: 0 0.75rem;
      border: 0;
      background: transparent;
      color: var(--unlock);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
  `,
})
export class UpdateBanner {
  protected readonly updates = inject(AppUpdates);
}
