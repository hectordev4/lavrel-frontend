import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
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
  /** On search results, the header's field shows what was searched, ready to refine. */
  protected readonly currentQuery = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const tree = this.router.parseUrl(this.router.url);
        const onResults =
          tree.root.children['primary']?.segments.map((s) => s.path).join('/') === 'search/results';
        return onResults ? String(tree.queryParams['q'] ?? '') : '';
      }),
    ),
    { initialValue: '' },
  );

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
