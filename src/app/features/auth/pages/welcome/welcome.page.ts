import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppBoot } from '../../../../core/boot';
import { CubeLogoMode } from '../../../../shared/ui/logo/cube-logo';
import { Wordmark } from '../../../../shared/ui/logo/wordmark';
import { LoadingScreen } from '../../../../shared/ui/loading-screen/loading-screen';
import { AuthFlow } from '../../data-access/auth-flow';
import { GoogleButton } from '../../ui/google-button';

@Component({
  selector: 'app-welcome-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Wordmark, GoogleButton, LoadingScreen],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePage {
  protected readonly flow = inject(AuthFlow);
  /** Right after the splash the L is already built, so just let it idle. */
  protected readonly markMode: CubeLogoMode = inject(AppBoot).cameFromSplash() ? 'idle' : 'intro';

  constructor() {
    this.flow.clearMessages();
  }
}
