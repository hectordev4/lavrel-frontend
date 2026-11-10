import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { MyAvatar } from '../../core/profile/my-avatar';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { Wordmark } from '../../shared/ui/wordmark/wordmark';

/** Top bar: the static wordmark, and the animated avatar (members) or a Sign in button (guests). */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Wordmark],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  private readonly store = inject(AuthStore);
  protected readonly me = inject(MyAvatar);

  protected readonly signedIn = computed(() => this.store.user() !== null);

  constructor() {
    effect(() => {
      if (this.store.isVerified()) void this.me.ensureLoaded();
    });
  }
}
