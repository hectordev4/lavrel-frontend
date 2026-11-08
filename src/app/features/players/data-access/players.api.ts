import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { PublicProfile, PublicProfileHeader } from '../models/public-profile.model';

/** Public profiles: no account needed. Private and unknown profiles both answer 404 profile_not_found. */
@Injectable({ providedIn: 'root' })
export class PlayersApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  /** GET /api/users?q=: public profiles whose name matches (2+ characters) or whose public id is exactly q. */
  search(query: string): Observable<PublicProfileHeader[]> {
    return this.http
      .get<{ users: PublicProfileHeader[] }>(`${this.base}/api/users`, { params: new HttpParams().set('q', query) })
      .pipe(map((r) => r.users));
  }

  profile(publicId: string): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${this.base}/api/users/${encodeURIComponent(publicId)}`);
  }
}
