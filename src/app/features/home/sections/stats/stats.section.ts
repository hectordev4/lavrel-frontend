import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { MemberOverviewApi } from '../../../../core/api/member-overview.api';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { sectionLoader } from '../../data-access/section-loader';
import { StatsRow } from '../../ui/stats-row/stats-row';

/** Home: the totals row (achievements, average completion, perfect games), once you own games. */
@Component({
  selector: 'app-stats-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatsRow],
  template: `
    @let s = stats.state();
    @if (s.kind === 'ready' && s.data.gamesOwned > 0) {
      <app-stats-row [stats]="s.data" />
    } @else if (s.kind === 'error') {
      <p class="failed">
        Your totals didn’t load.
        <button type="button" (click)="stats.load()">Try again</button>
      </p>
    }
  `,
  styleUrl: '../section.scss',
})
export class StatsSection {
  private readonly api = inject(MemberOverviewApi);
  protected readonly stats = sectionLoader(() => this.api.stats());

  constructor() {
    const accounts = inject(PlatformAccounts);
    // Once, and again after every sync.
    effect(() => {
      accounts.syncVersion();
      untracked(() => this.stats.load());
    });
  }
}
