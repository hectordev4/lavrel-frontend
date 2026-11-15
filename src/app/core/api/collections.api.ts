import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { Collection } from './models/collection.model';

/**
 * The member's collections of owned games, under /api/currentuser/collections. Browse one with
 * GET /api/currentuser/games?collection={id}. Deleting a collection keeps its games in the library.
 */
@Injectable({ providedIn: 'root' })
export class CollectionsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_ENV).apiBaseUrl}/api/currentuser/collections`;

  list(): Observable<Collection[]> {
    return this.http.get<{ collections: Collection[] }>(this.url).pipe(map((r) => r.collections));
  }

  create(name: string): Observable<Collection> {
    return this.http.post<Collection>(this.url, { name });
  }

  rename(id: string, name: string): Observable<Collection> {
    return this.http.patch<Collection>(`${this.url}/${id}`, { name });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** New order: every collection exactly once. */
  reorder(ids: string[]): Observable<Collection[]> {
    return this.http
      .put<{ collections: Collection[] }>(this.url, { collectionIds: ids })
      .pipe(map((r) => r.collections));
  }

  /** Only owned games (422 game_not_owned otherwise). Idempotent. */
  addGame(id: string, gameId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/games/${gameId}`, null);
  }

  removeGame(id: string, gameId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/games/${gameId}`);
  }
}
