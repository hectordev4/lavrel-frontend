import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { MyAvatar } from '../../core/profile/my-avatar';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { SearchBox } from '../../shared/ui/search-box/search-box';
import { Wordmark } from '../../shared/ui/wordmark/wordmark';

/**
 * Top bar: the static wordmark, and the animated avatar (members) or a Sign in button (guests). On desktop the
 * wordmark moves to the sidebar and a search field takes its place; Enter opens the results.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Wordmark, SearchBox],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  private readonly store = inject(AuthStore);
  protected readonly me = inject(MyAvatar);
  private readonly router = inject(Router);

  protected readonly signedIn = computed(() => this.store.user() !== null);

  constructor() {
    effect(() => {
      if (this.store.isVerified()) void this.me.ensureLoaded();
    });
  }

  protected search(query: string): void {
    const q = query.trim();
    if (q) void this.router.navigate(['/search/results'], { queryParams: { q } });
  }
}
