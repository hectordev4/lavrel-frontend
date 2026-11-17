import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppBoot } from '../../../../core/boot';
import { signOutMessage } from '../../../../core/auth/sign-out-reason';
import { CubeLogoMode } from '../../../../shared/ui/cube-logo/models/cube-logo-mode.model';
import { Wordmark } from '../../../../shared/ui/wordmark/wordmark';
import { LoadingScreen } from '../../../../shared/ui/loading-screen/loading-screen';
import { AuthFlow } from '../../data-access/auth-flow';
import { GoogleButton } from '../../ui/google-button/google-button';

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

  private readonly reason = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });
  /**
   * The alert: a sign-in error first; otherwise why the app ended the session (`?reason=…`), until the person
   * starts signing in again.
   */
  protected readonly alert = computed(
    () =>
      this.flow.error() ?? (this.flow.busy() ? null : signOutMessage(this.reason().get('reason'))),
  );

  constructor() {
    this.flow.clearMessages();
  }
}
