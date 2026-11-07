import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { CreatorOption } from '../models/creator-option.model';
import { CreatorRole } from '../models/creator-role.model';
import { TagOption } from '../models/tag-option.model';

/** Options for the search filters, each with its number of games. Public; q is optional. */
@Injectable({ providedIn: 'root' })
export class FilterOptionsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  /** GET /api/tags?q=: names containing q, those starting with it first; without q, the most used. */
  tags(query = ''): Observable<TagOption[]> {
    return this.http
      .get<{ tags: TagOption[] }>(`${this.base}/api/tags`, { params: optionalQuery(query) })
      .pipe(map((r) => r.tags));
  }

  /** GET /api/creators?role=franchise|developer|publisher&q= */
  creators(role: CreatorRole, query = ''): Observable<CreatorOption[]> {
    const params = optionalQuery(query).set('role', role.toLowerCase());
    return this.http
      .get<{ creators: CreatorOption[] }>(`${this.base}/api/creators`, { params })
      .pipe(map((r) => r.creators));
  }
}

function optionalQuery(query: string): HttpParams {
  const q = query.trim();
  return q ? new HttpParams().set('q', q) : new HttpParams();
}
