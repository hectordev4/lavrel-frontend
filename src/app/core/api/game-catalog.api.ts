import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { GamePage } from './models/game-page.model';
import { GameSearchParams } from './models/game-search-params.model';

/** The public game catalog. Works without an account; used by Home, Search and more. */
@Injectable({ providedIn: 'root' })
export class GameCatalogApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  search(params: GameSearchParams = {}): Observable<GamePage> {
    return this.http.get<GamePage>(`${this.base}/api/games`, { params: toHttpParams(params) });
  }
}

function toHttpParams(p: GameSearchParams): HttpParams {
  let params = new HttpParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== '') params = params.append(key, String(value));
  };
  set('q', p.q?.trim());
  p.tags?.forEach((tag) => set('tag', tag));
  set('franchise', p.franchise);
  set('developer', p.developer);
  set('publisher', p.publisher);
  p.modes?.forEach((mode) => set('mode', mode));
  set('system', p.system);
  set('sort', p.sort);
  set('page', p.page);
  set('size', p.size);
  return params;
}
