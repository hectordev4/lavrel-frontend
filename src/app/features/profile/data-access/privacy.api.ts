import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { ProfileSettings } from '../models/profile-settings.model';

/** GET / PATCH /api/currentuser/profile: the public profile switches. PATCH takes only what changes. */
@Injectable({ providedIn: 'root' })
export class PrivacyApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_ENV).apiBaseUrl}/api/currentuser/profile`;

  get(): Observable<ProfileSettings> {
    return this.http.get<ProfileSettings>(this.url);
  }

  update(change: Partial<ProfileSettings>): Observable<ProfileSettings> {
    return this.http.patch<ProfileSettings>(this.url, change);
  }
}
