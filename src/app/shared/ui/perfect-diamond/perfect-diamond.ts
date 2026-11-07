import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The faceted diamond for a game at 100%; its colours cycle through the hues. */
@Component({
  selector: 'app-perfect-diamond',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './perfect-diamond.html',
  styleUrl: './perfect-diamond.scss',
})
export class PerfectDiamond {
  /** Accessible name; empty when text next to it already says it. */
  readonly label = input('Completed 100%');
}
