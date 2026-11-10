import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { AuthFlow } from '../../data-access/auth-flow';

const RESEND_COOLDOWN_S = 30;

/** Shown to e-mail accounts until they click the link. The backend blocks them from most endpoints. */
@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.scss',
})
export class VerifyEmailPage {
  protected readonly flow = inject(AuthFlow);
  private readonly store = inject(AuthStore);
  protected readonly email = computed(() => this.store.user()?.email ?? 'your e-mail');
  protected readonly cooldown = signal(RESEND_COOLDOWN_S); // the sign-up just sent one

  private readonly timer = setInterval(() => this.cooldown.update((s) => Math.max(0, s - 1)), 1000);

  constructor() {
    this.flow.clearMessages();
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected async resend(): Promise<void> {
    await this.flow.resendVerification();
    if (!this.flow.error()) this.cooldown.set(RESEND_COOLDOWN_S);
  }
}
