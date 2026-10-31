import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { CurrentUser } from './models/current-user.model';

/**
 * GET /api/currentuser. The first call after sign-up is also what creates the user row
 * on the backend (with a random starting name like SwiftOtter).
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  get(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.base}/api/currentuser`);
  }
}
