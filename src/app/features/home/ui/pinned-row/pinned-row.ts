import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackedGame } from '../../../../core/api/models/tracked-game.model';
import { PerfectDiamond } from '../../../../shared/ui/perfect-diamond/perfect-diamond';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { progressPercent } from '../../../../shared/ui/progress-bar/progress-tier';
import { gameLink } from '../../../../shared/utils/game-link';

/** A pinned game on Home: cover, title, percentage, tiered bar, and unlocked of total. */
@Component({
  selector: 'app-pinned-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover, PerfectDiamond, ProgressBar],
  templateUrl: './pinned-row.html',
  styleUrl: './pinned-row.scss',
})
export class PinnedRow {
  readonly game = input.required<TrackedGame>();

  protected readonly link = computed(() => gameLink(this.game().slug));
  protected readonly percent = computed(() => progressPercent(this.game().unlocked, this.game().total));
}
