import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { progressTier } from './progress-tier';

/** A thin bar coloured by tier; 100% shifts hue with an aura, 90–99% has a steady gold aura. */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  readonly percent = input.required<number>();
  /** What the bar measures, for screen readers, e.g. "Achievements unlocked". */
  readonly label = input('Progress');

  protected readonly clamped = computed(() => Math.max(0, Math.min(100, this.percent())));
  protected readonly tier = computed(() => progressTier(this.clamped()));
}
