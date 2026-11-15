import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { MemberOverviewApi } from '../../../../core/api/member-overview.api';
import { PlatformAccounts } from '../../../../core/platforms/platform-accounts';
import { sectionLoader } from '../../data-access/section-loader';
import { RecentUnlock } from '../../ui/recent-unlock/recent-unlock';

/** Home: your three latest unlocks. Hidden when there are none. */
@Component({
  selector: 'app-recent-unlocks-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecentUnlock],
  template: `
    @let s = recent.state();
    @if (s.kind === 'ready' && s.data.length) {
      <section aria-labelledby="recent-title">
        <div class="section-head"><h2 id="recent-title">Recent unlocks</h2></div>
        <div>
          @for (u of s.data; track u.achievementId) {
            <app-recent-unlock [unlock]="u" />
          }
        </div>
      </section>
    } @else if (s.kind === 'error') {
      <p class="failed">
        Your recent unlocks didn’t load.
        <button type="button" (click)="recent.load()">Try again</button>
      </p>
    }
  `,
  styleUrl: '../section.scss',
})
export class RecentUnlocksSection {
  private readonly api = inject(MemberOverviewApi);
  protected readonly recent = sectionLoader(() => this.api.recentUnlocks(3));

  constructor() {
    const accounts = inject(PlatformAccounts);
    effect(() => {
      accounts.syncVersion();
      untracked(() => this.recent.load());
    });
  }
}
