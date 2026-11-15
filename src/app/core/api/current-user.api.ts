import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { CurrentUser } from './models/current-user.model';

/**
 * GET /api/currentuser. The first call after sign-up is also what creates the user row
 * on the backend (with a random starting name like SwiftOtter). PUT /api/currentuser/setup
 * marks the first setup as done.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  get(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.base}/api/currentuser`);
  }

  /** The first setup was saved or skipped. No body, 204; calling it again changes nothing. */
  completeSetup(): Observable<void> {
    return this.http.put<void>(`${this.base}/api/currentuser/setup`, null);
  }
}
