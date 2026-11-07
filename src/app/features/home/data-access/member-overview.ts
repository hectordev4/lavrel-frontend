import { Injectable, inject, signal } from '@angular/core';
import { MemberStats } from '../models/member-stats.model';
import { RecentUnlock } from '../models/recent-unlock.model';
import { MemberOverviewApi } from './member-overview.api';

/** Home's totals and latest unlocks. Each loads on its own, so one failing doesn't hide the other. */
@Injectable()
export class MemberOverview {
  private readonly api = inject(MemberOverviewApi);

  readonly stats = signal<MemberStats | null>(null);
  readonly recent = signal<RecentUnlock[] | null>(null);
  readonly statsFailed = signal(false);
  readonly recentFailed = signal(false);

  load(): void {
    this.statsFailed.set(false);
    this.recentFailed.set(false);
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: () => this.statsFailed.set(true) });
    this.api.recentUnlocks(3).subscribe({ next: (r) => this.recent.set(r), error: () => this.recentFailed.set(true) });
  }
}
