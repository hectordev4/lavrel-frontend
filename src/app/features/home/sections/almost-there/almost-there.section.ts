import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { AlmostThere } from '../../data-access/almost-there';
import { AlmostTile } from '../../ui/almost-tile/almost-tile';

/** Home: owned games closest to 100%. Hidden when there are none. */
@Component({
  selector: 'app-almost-there-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlmostTile],
  providers: [AlmostThere],
  template: `
    @let s = almost.state();
    @if (s.kind === 'ready' && s.games.length) {
      <section aria-labelledby="almost-title">
        <div class="section-head">
          <h2 id="almost-title">Almost there</h2>
          <span class="muted small">Closest to 100%</span>
        </div>
        <div class="carousel">
          @for (game of s.games; track game.gameId) {
            <app-almost-tile [game]="game" />
          }
        </div>
      </section>
    } @else if (s.kind === 'error') {
      <p class="failed">
        Almost there didn’t load.
        <button type="button" (click)="almost.load()">Try again</button>
      </p>
    }
  `,
  styleUrl: '../section.scss',
})
export class AlmostThereSection {
  protected readonly almost = inject(AlmostThere);

  constructor() {
    const accounts = inject(PlatformAccounts);
    effect(() => {
      accounts.syncVersion();
      untracked(() => this.almost.load());
    });
  }
}
