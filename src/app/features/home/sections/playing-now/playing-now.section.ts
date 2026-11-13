import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAX_PINNED, TrackedGames } from '../../../../core/tracking/tracked-games';
import { PinnedRow } from '../../ui/pinned-row/pinned-row';

/** Home: the games pinned to quick access, in their order, with Edit and Pin a game. */
@Component({
  selector: 'app-playing-now-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PinnedRow],
  templateUrl: './playing-now.section.html',
  styleUrls: ['../section.scss', './playing-now.section.scss'],
})
export class PlayingNowSection {
  protected readonly tracked = inject(TrackedGames);
  protected readonly maxPinned = MAX_PINNED;

  constructor() {
    this.tracked.ensureLoaded();
  }
}
