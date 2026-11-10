import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CUBE_ORIGINS } from './cube-logo.geometry';
import { CubeLogoMode } from './models/cube-logo-mode.model';

/** The cube L from the brand mark, animated according to its mode. */
@Component({
  selector: 'app-cube-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cube-logo.html',
  styleUrl: './cube-logo.scss',
  host: { '[class]': '"mode-" + mode()' },
})
export class CubeLogo {
  readonly mode = input<CubeLogoMode>('still');
  /** Accessible name; pass an empty string when a visible wordmark already says "Lavrel". */
  readonly label = input('Lavrel');

  protected readonly cubes = CUBE_ORIGINS;
}
