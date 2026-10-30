import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CubeLogo } from '../../../../shared/ui/logo/cube-logo';
import { AuthFlow } from '../../data-access/auth-flow';

const RESEND_COOLDOWN_S = 30;

/** Shown to e-mail accounts until they click the link. The backend blocks them from most endpoints. */
@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  template: `
    <main class="page verify">
      <app-cube-logo class="mark" [mode]="flow.busy() === 'check' ? 'loading' : 'idle'" label="" />

      <h1>Check your inbox</h1>
      <p class="lead">
        We sent a confirmation link to <strong>{{ email() }}</strong>. Open it on any device, then come back here.
      </p>

      @if (flow.error(); as error) {
        <p class="alert" role="alert">{{ error }}</p>
      }
      @if (flow.notice(); as notice) {
        <p class="notice" role="status">{{ notice }}</p>
      }

      <div class="actions">
        <button type="button" class="btn btn-primary" [disabled]="flow.busy() !== null" (click)="flow.checkVerified()">
          {{ flow.busy() === 'check' ? 'Checking…' : 'I’ve confirmed my e-mail' }}
        </button>
        <button type="button" class="btn btn-secondary" [disabled]="flow.busy() !== null || cooldown() > 0" (click)="resend()">
          {{ cooldown() > 0 ? 'Send again in ' + cooldown() + 's' : 'Send the link again' }}
        </button>
        <button type="button" class="link-btn" [disabled]="flow.busy() !== null" (click)="flow.signOut()">
          Use a different account
        </button>
      </div>
    </main>
  `,
  styles: `
    .verify {
      display: flex;
      flex-direction: column;
      padding-top: clamp(3rem, 14vh, 7rem);
    }
    .mark {
      height: 5.5rem;
      width: 3rem;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .lead {
      margin: 0 0 1.5rem;
      color: var(--muted);
      line-height: 1.55;
      strong { color: var(--line); font-weight: 600; word-break: break-all; }
    }
    .actions {
      display: grid;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 2rem;
    }
    .link-btn { justify-self: center; }
  `,
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
