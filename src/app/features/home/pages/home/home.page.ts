import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirstSetup } from '../../../../core/profile/first-setup';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { greetingFor } from '../../../../shared/utils/greeting';
import { HomeProfile } from '../../data-access/home-profile';
import { AlmostThereSection } from '../../sections/almost-there/almost-there.section';
import { DiscoverSection } from '../../sections/discover/discover.section';
import { PlayingNowSection } from '../../sections/playing-now/playing-now.section';
import { RecentUnlocksSection } from '../../sections/recent-unlocks/recent-unlocks.section';
import { StatsSection } from '../../sections/stats/stats.section';
import { SyncSection } from '../../sections/sync/sync.section';

/**
 * Home for members. The page only does what it needs to appear: it waits for the first GET /api/currentuser
 * (which creates the user on the backend), greets, and places the sections. Each section loads its own data and
 * shows its own error, so one failing never takes Home down; the lower ones load as they scroll into view.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CubeLogo,
    SyncSection,
    StatsSection,
    PlayingNowSection,
    AlmostThereSection,
    RecentUnlocksSection,
    DiscoverSection,
  ],
  providers: [HomeProfile],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly profile = inject(HomeProfile);
  private readonly accounts = inject(PlatformAccounts);

  protected readonly greeting = greetingFor(new Date());
  /** No Steam account yet: popular and new games to start from. */
  protected readonly firstVisit = computed(
    () => this.accounts.loadState() === 'ready' && !this.accounts.steam(),
  );

  constructor() {
    this.profile.load();
    // Until the backend says the first setup is done, Home sends the member there.
    const firstSetup = inject(FirstSetup);
    const router = inject(Router);
    effect(() => {
      const state = this.profile.state();
      if (state.kind === 'ready' && firstSetup.neededFor(state.user)) {
        void router.navigateByUrl('/setup', { replaceUrl: true });
      }
    });
  }
}
