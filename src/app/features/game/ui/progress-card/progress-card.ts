import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PerfectDiamond } from '../../../../shared/ui/perfect-diamond/perfect-diamond';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { progressPercent } from '../../../../shared/ui/progress-bar/progress-tier';

/** "Your progress" on a game: unlocked of total, the tiered bar, and the diamond at 100%. */
@Component({
  selector: 'app-progress-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PerfectDiamond, ProgressBar],
  templateUrl: './progress-card.html',
  styleUrl: './progress-card.scss',
})
export class ProgressCard {
  readonly unlocked = input.required<number>();
  readonly total = input.required<number>();

  protected readonly percent = computed(() => progressPercent(this.unlocked(), this.total()));
}
