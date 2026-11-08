import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { PublicProfile } from '../models/public-profile.model';

/** Public profiles: no account needed. Private and unknown profiles both answer 404 profile_not_found. */
@Injectable({ providedIn: 'root' })
export class PlayersApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  profile(publicId: string): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${this.base}/api/users/${encodeURIComponent(publicId)}`);
  }
}
