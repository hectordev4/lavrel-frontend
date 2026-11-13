import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { MemberOverviewApi } from '../../../core/api/member-overview.api';
import { MemberStats } from '../../../core/api/models/member-stats.model';
import { RecentUnlock } from '../../../core/api/models/recent-unlock.model';

/**
 * Home's totals and latest unlocks. Each loads on its own, so one failing doesn't hide the other, and each new
 * load cancels the one still running, so only the latest answer is shown.
 */
@Injectable()
export class MemberOverview {
  private readonly api = inject(MemberOverviewApi);
  private readonly loads = new Subject<void>();

  readonly stats = signal<MemberStats | null>(null);
  readonly recent = signal<RecentUnlock[] | null>(null);
  readonly statsFailed = signal(false);
  readonly recentFailed = signal(false);

  constructor() {
    this.loads
      .pipe(
        switchMap(() => this.api.stats().pipe(map((s): MemberStats | null => s), catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((s) => (s ? this.stats.set(s) : this.statsFailed.set(true)));
    this.loads
      .pipe(
        switchMap(() => this.api.recentUnlocks(3).pipe(map((r): RecentUnlock[] | null => r), catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((r) => (r ? this.recent.set(r) : this.recentFailed.set(true)));
  }

  load(): void {
    this.statsFailed.set(false);
    this.recentFailed.set(false);
    this.loads.next();
  }
}
