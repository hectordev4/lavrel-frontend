import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { Platform } from './models/platform.model';
import { PlatformAccount } from './models/platform-account.model';
import { SyncResult } from './models/sync-result.model';

/** The member's linked platform accounts, under /api/currentuser/accounts. */
@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_ENV).apiBaseUrl}/api/currentuser/accounts`;

  list(): Observable<PlatformAccount[]> {
    return this.http.get<{ accounts: PlatformAccount[] }>(this.url).pipe(map((r) => r.accounts));
  }

  /** The platform's login page to send the browser to. It comes back to /steam/linked. */
  linkUrl(platform: Platform): Observable<string> {
    return this.http
      .post<{ redirectUrl: string }>(`${this.url}/${platform.toLowerCase()}/link`, null)
      .pipe(map((r) => r.redirectUrl));
  }

  sync(account: PlatformAccount): Observable<SyncResult> {
    return this.http.post<SyncResult>(
      `${this.url}/${account.platform.toLowerCase()}/${encodeURIComponent(account.externalId)}/sync`,
      null,
    );
  }
}
