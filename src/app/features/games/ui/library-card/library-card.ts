import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryGame } from '../../../../core/api/models/library-game.model';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { PerfectDiamond } from '../../../../shared/ui/perfect-diamond/perfect-diamond';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { progressPercent } from '../../../../shared/ui/progress-bar/progress-tier';
import { gameLink } from '../../../../shared/utils/game-link';
import { playtimeLabel } from '../../data-access/library-labels';

/** An owned game in the library grid: cover, title, tiered bar, unlocked of total, playtime. Content inside is its menu. */
@Component({
  selector: 'app-library-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover, PerfectDiamond, ProgressBar],
  templateUrl: './library-card.html',
  styleUrl: './library-card.scss',
})
export class LibraryCard {
  readonly game = input.required<LibraryGame>();

  protected readonly link = computed(() => gameLink(this.game().slug));
  protected readonly percent = computed(() => progressPercent(this.game().unlocked, this.game().total));
  protected readonly playtime = computed(() => playtimeLabel(this.game().playtimeMinutes));
}
