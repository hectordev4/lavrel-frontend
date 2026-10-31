import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CubeLogo } from '../cube-logo/cube-logo';
import { CubeLogoMode } from '../cube-logo/models/cube-logo-mode.model';

/** The brand lockup: the cube L leading "avrel", read as Lavrel. */
@Component({
  selector: 'app-wordmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  templateUrl: './wordmark.html',
  styleUrl: './wordmark.scss',
})
export class Wordmark {
  readonly mode = input<CubeLogoMode>('still');
  protected readonly letters = ['A', 'V', 'R', 'E', 'L'];
}
