import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { MAX_PINNED, TrackedGames } from '../../../../core/tracking/tracked-games';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { CubeLogo } from '../../../../shared/ui/cube-logo/cube-logo';
import { GameRow } from '../../../../shared/ui/game-row/game-row';
import { GameTile } from '../../../../shared/ui/game-tile/game-tile';
import { relativeTime } from '../../../../shared/utils/relative-time';
import { AlmostThere } from '../../data-access/almost-there';
import { Discover } from '../../data-access/discover';
import { HomeProfile } from '../../data-access/home-profile';
import { MemberOverview } from '../../data-access/member-overview';
import { AlmostTile } from '../../ui/almost-tile/almost-tile';
import { PinnedRow } from '../../ui/pinned-row/pinned-row';
import { RecentUnlock } from '../../ui/recent-unlock/recent-unlock';
import { StatsRow } from '../../ui/stats-row/stats-row';

/**
 * Home for members: greeting, Steam sync (or Connect Steam), the pinned games, the games closest to 100%,
 * and, until Steam is connected, popular and new games to start from.
 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CtaCard,
    CubeLogo,
    GameRow,
    GameTile,
    AlmostTile,
    PinnedRow,
    RecentUnlock,
    StatsRow,
  ],
  providers: [HomeProfile, AlmostThere, Discover, MemberOverview],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly profile = inject(HomeProfile);
  protected readonly accounts = inject(PlatformAccounts);
  protected readonly tracked = inject(TrackedGames);
  protected readonly almost = inject(AlmostThere);
  protected readonly discover = inject(Discover);
  protected readonly overview = inject(MemberOverview);

  protected readonly maxPinned = MAX_PINNED;
  protected readonly greeting = greetingFor(new Date());
  protected readonly lastSynced = computed(() => {
    const at = this.accounts.steam()?.lastSyncedAt;
    return at ? `synced ${relativeTime(at)}` : 'not synced yet';
  });
  /** No Steam account yet: show the connect card and popular games to start from. */
  protected readonly firstVisit = computed(
    () => this.accounts.loadState() === 'ready' && !this.accounts.steam(),
  );

  /** The first GET /api/currentuser creates the user on the backend, so everything else waits for it. */
  private readonly ready = computed(() => this.profile.state().kind === 'ready');

  constructor() {
    this.profile.load();

    effect(() => {
      if (!this.ready()) return;
      untracked(() => {
        this.accounts.ensureLoaded();
        this.tracked.ensureLoaded();
      });
    });
    // Almost there, totals and recent unlocks: once ready, and again whenever a sync finishes.
    effect(() => {
      this.accounts.syncVersion();
      if (this.ready())
        untracked(() => {
          this.almost.load();
          this.overview.load();
        });
    });
    // Popular and new games only for the first visit.
    effect(() => {
      if (this.firstVisit()) untracked(() => this.discover.loadAll());
    });
  }

  protected syncNow(): void {
    const steam = this.accounts.steam();
    if (steam) void this.accounts.sync(steam);
  }

  protected connectSteam(): void {
    void this.accounts.link('STEAM');
  }
}

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night,';
  if (hour < 12) return 'Good morning,';
  if (hour < 19) return 'Good afternoon,';
  return 'Good evening,';
}
