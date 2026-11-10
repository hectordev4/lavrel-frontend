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
  private readonly base = inject(APP_ENV).apiBaseUrl;
  private readonly url = `${this.base}/api/currentuser/accounts`;
  private readonly autoSyncUrl = `${this.base}/api/currentuser/auto-sync`;

  list(): Observable<PlatformAccount[]> {
    return this.http.get<{ accounts: PlatformAccount[] }>(this.url).pipe(map((r) => r.accounts));
  }

  /** The platform's login page to send the browser to. It comes back to /steam/linked. */
  linkUrl(platform: Platform): Observable<string> {
    return this.http
      .post<{ redirectUrl: string }>(`${this.url}/${platform.toLowerCase()}/link`, null)
      .pipe(map((r) => r.redirectUrl));
  }

  /** Removes the link; the games stay in the catalog, the member's copy of them goes. */
  unlink(account: PlatformAccount): Observable<void> {
    return this.http.delete<void>(`${this.url}/${account.platform.toLowerCase()}/${encodeURIComponent(account.externalId)}`);
  }

  /** Automatic background sync of every linked account (on by default). */
  autoSync(): Observable<boolean> {
    return this.http.get<{ enabled: boolean }>(`${this.autoSyncUrl}`).pipe(map((r) => r.enabled));
  }

  setAutoSync(enabled: boolean): Observable<boolean> {
    return this.http.put<{ enabled: boolean }>(`${this.autoSyncUrl}`, { enabled }).pipe(map((r) => r.enabled));
  }

  sync(account: PlatformAccount): Observable<SyncResult> {
    return this.http.post<SyncResult>(
      `${this.url}/${account.platform.toLowerCase()}/${encodeURIComponent(account.externalId)}/sync`,
      null,
    );
  }
}
