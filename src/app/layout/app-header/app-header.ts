import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { Wordmark } from '../../shared/ui/wordmark/wordmark';

/** Top bar: the static wordmark, and the avatar (members) or a Sign in button (guests). */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Wordmark],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  private readonly store = inject(AuthStore);

  protected readonly signedIn = computed(() => this.store.user() !== null);
  /** Until the profile feature brings avatars: the e-mail's first letter. */
  protected readonly initial = computed(() => (this.store.user()?.email ?? '?').charAt(0).toUpperCase());
}
