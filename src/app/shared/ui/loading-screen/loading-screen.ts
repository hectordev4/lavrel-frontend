import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CubeLogo } from '../cube-logo/cube-logo';
import { CubeLogoMode } from '../cube-logo/models/cube-logo-mode.model';

/**
 * Full-screen loading page: the cube L with the light chasing through it.
 * Used for the app boot (mode "boot") and while a sign-in is finishing.
 */
@Component({
  selector: 'app-loading-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.scss',
})
export class LoadingScreen {
  readonly mode = input<CubeLogoMode>('loading');
  readonly message = input<string>('');
}
