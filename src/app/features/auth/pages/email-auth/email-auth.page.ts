import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { LoadingScreen } from '../../../../shared/ui/loading-screen/loading-screen';
import { AuthFlow } from '../../data-access/auth-flow';

export type EmailAuthMode = 'sign-in' | 'register';

/** One page for both e-mail sign-in and registration; the route data picks the mode. */
@Component({
  selector: 'app-email-auth-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CubeLogo, LoadingScreen],
  templateUrl: './email-auth.page.html',
  styleUrl: './email-auth.page.scss',
})
export class EmailAuthPage {
  protected readonly flow = inject(AuthFlow);
  protected readonly mode = toSignal(
    inject(ActivatedRoute).data.pipe(map((d) => (d['mode'] as EmailAuthMode) ?? 'sign-in')),
    { requireSync: true },
  );
  protected readonly isRegister = computed(() => this.mode() === 'register');
  protected readonly showPassword = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.flow.clearMessages();
  }

  protected fieldError(name: 'email' | 'password'): string | null {
    const control = this.form.controls[name];
    if (!this.submitted() && !control.touched) return null;
    if (control.hasError('required')) return name === 'email' ? 'Enter your e-mail.' : 'Enter your password.';
    if (control.hasError('email')) return 'Enter a valid e-mail address, like name@example.com.';
    if (control.hasError('minlength') && this.isRegister()) return 'Use at least 8 characters.';
    return null;
  }

  protected submit(): void {
    this.submitted.set(true);
    // Sign-in only needs a non-empty password: old accounts may have shorter ones.
    const passwordOk = this.isRegister() ? this.form.controls.password.valid : !!this.form.controls.password.value;
    if (this.form.controls.email.invalid || !passwordOk) return;

    const { email, password } = this.form.getRawValue();
    void (this.isRegister() ? this.flow.register(email.trim(), password) : this.flow.signInWithEmail(email.trim(), password));
  }

  protected forgotPassword(): void {
    const email = this.form.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      this.submitted.set(true);
      return;
    }
    void this.flow.sendPasswordReset(email.value.trim());
  }
}
