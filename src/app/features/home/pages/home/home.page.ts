import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthSession } from '../../../../core/auth/auth-session';
import { AuthStore } from '../../../../core/auth/auth.store';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { HomeProfile } from '../../data-access/home-profile';

/** Placeholder landing after sign-in: shows the profile once it loads, and signs out. */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CubeLogo],
  providers: [HomeProfile],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly profile = inject(HomeProfile);
  protected readonly store = inject(AuthStore);
  private readonly session = inject(AuthSession);
  protected readonly signingOut = signal(false);

  constructor() {
    this.profile.load();
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.session.signOut();
    } finally {
      this.signingOut.set(false);
    }
  }
}
