import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CubeLogo } from '../cube-logo/cube-logo';

/**
 * A call to action with the big animated cube L: the cubes build in, then a shake wave runs
 * through them every few seconds. Put the action buttons inside the tag.
 */
@Component({
  selector: 'app-cta-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  templateUrl: './cta-card.html',
  styleUrl: './cta-card.scss',
})
export class CtaCard {
  readonly heading = input.required<string>();
  readonly text = input<string>('');
  /** Stacks the L above the text, for full-screen messages. */
  readonly centered = input(false);
}
