import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryGame } from '../../../../core/api/models/library-game.model';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { progressPercent } from '../../../../shared/ui/progress-bar/progress-tier';

/** A game close to 100% in the Almost there row: cover, title, bar, "96% · 1 left". */
@Component({
  selector: 'app-almost-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover, ProgressBar],
  templateUrl: './almost-tile.html',
  styleUrl: './almost-tile.scss',
})
export class AlmostTile {
  readonly game = input.required<LibraryGame>();

  protected readonly link = computed(() => {
    const g = this.game();
    return g.slug ? `/games/${g.gameId}-${g.slug}` : `/games/${g.gameId}`;
  });
  protected readonly percent = computed(() => progressPercent(this.game().unlocked, this.game().total));
  protected readonly left = computed(() => this.game().total - this.game().unlocked);
}
