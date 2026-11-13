import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameRow } from '../../../../shared/ui/game-row/game-row';
import { GameTile } from '../../../../shared/ui/game-tile/game-tile';
import { Discover } from '../../data-access/discover';

/** Home before Steam is connected: popular games and new releases to start from. */
@Component({
  selector: 'app-discover-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameRow, GameTile],
  providers: [Discover],
  template: `
    @let popular = discover.popular();
    @let newest = discover.newest();
    @if (popular.kind === 'ready') {
      <section aria-labelledby="popular-title">
        <div class="section-head">
          <div>
            <h2 id="popular-title">Popular on Lavrel</h2>
            <span class="muted small">Most reviewed games in the catalog</span>
          </div>
        </div>
        <div class="rows">
          @for (game of popular.games; track game.id) {
            <app-game-row [game]="game" />
          }
        </div>
      </section>
    }
    @if (newest.kind === 'ready') {
      <section aria-labelledby="new-title">
        <div class="section-head"><h2 id="new-title">New releases</h2></div>
        <div class="carousel">
          @for (game of newest.games; track game.id) {
            <app-game-tile [game]="game" />
          }
        </div>
      </section>
    }
    @if (popular.kind === 'error' || newest.kind === 'error') {
      <p class="failed">
        Some games to start from didn’t load.
        <button type="button" (click)="discover.loadAll()">Try again</button>
      </p>
    }
  `,
  styleUrl: '../section.scss',
})
export class DiscoverSection {
  protected readonly discover = inject(Discover);

  constructor() {
    this.discover.loadAll();
  }
}
