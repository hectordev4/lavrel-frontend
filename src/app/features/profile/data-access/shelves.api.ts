import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { ShelfType } from '../../../core/profile/shelf-types';
import { MyShelf } from '../models/my-shelf.model';

/** My public profile's shelves, under /api/currentuser/profile/shelves. */
@Injectable({ providedIn: 'root' })
export class ShelvesApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_ENV).apiBaseUrl}/api/currentuser/profile/shelves`;

  list(): Observable<MyShelf[]> {
    return this.http.get<{ shelves: MyShelf[] }>(this.url).pipe(map((r) => r.shelves));
  }

  add(type: ShelfType, title: string | null, collectionId: string | null): Observable<MyShelf> {
    return this.http.post<MyShelf>(this.url, { type, title, collectionId });
  }

  retitle(id: string, title: string | null): Observable<MyShelf> {
    return this.http.patch<MyShelf>(`${this.url}/${id}`, { title });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** Every shelf id once, in the new order. */
  reorder(shelfIds: string[]): Observable<MyShelf[]> {
    return this.http
      .put<{ shelves: MyShelf[] }>(this.url, { shelfIds })
      .pipe(map((r) => r.shelves));
  }

  /** ACHIEVEMENTS shelves: up to 12 of my unlocks, in order. */
  showAchievements(id: string, achievementIds: number[]): Observable<MyShelf> {
    return this.http.put<MyShelf>(`${this.url}/${id}/achievements`, { achievementIds });
  }
}
