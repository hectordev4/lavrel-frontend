import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { QuickResults } from '../models/quick-results.model';

/** The type-ahead behind the search box. Public; needs at least 2 characters. */
@Injectable({ providedIn: 'root' })
export class QuickSearchApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  search(query: string): Observable<QuickResults> {
    return this.http.get<QuickResults>(`${this.base}/api/search`, { params: new HttpParams().set('q', query) });
  }
}
