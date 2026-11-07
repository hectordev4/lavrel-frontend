import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { LibraryPage } from './models/library-page.model';
import { LibraryParams } from './models/library-params.model';

/** The member's own games across linked accounts: GET /api/currentuser/games. Used by Home and My library. */
@Injectable({ providedIn: 'root' })
export class LibraryApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  list(p: LibraryParams = {}): Observable<LibraryPage> {
    let params = new HttpParams();
    const set = (key: string, value: string | number | undefined) => {
      if (value !== undefined && value !== '') params = params.append(key, String(value));
    };
    set('q', p.q?.trim());
    p.tags?.forEach((tag) => set('tag', tag));
    p.modes?.forEach((mode) => set('mode', mode));
    set('collection', p.collection);
    set('sort', p.sort);
    set('page', p.page);
    set('size', p.size);
    return this.http.get<LibraryPage>(`${this.base}/api/currentuser/games`, { params });
  }
}
