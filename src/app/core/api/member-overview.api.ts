import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { MemberStats } from './models/member-stats.model';
import { RecentUnlock } from './models/recent-unlock.model';

/** The member's own totals and latest unlocks, for Home. */
@Injectable({ providedIn: 'root' })
export class MemberOverviewApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  stats(): Observable<MemberStats> {
    return this.http.get<MemberStats>(`${this.base}/api/currentuser/stats`);
  }

  /** limit: 1 to 20. */
  recentUnlocks(limit = 3): Observable<RecentUnlock[]> {
    return this.http
      .get<{ achievements: RecentUnlock[] }>(`${this.base}/api/currentuser/achievements/recent`, {
        params: new HttpParams().set('limit', limit),
      })
      .pipe(map((r) => r.achievements));
  }
}
