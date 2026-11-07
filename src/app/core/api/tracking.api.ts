import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_ENV } from '../config/app-env.token';
import { TrackedGame } from './models/tracked-game.model';
import { TrackingStatus } from './models/tracking-status.model';

interface TrackedGamesResponse {
  games: TrackedGame[];
}

/** The member's tracking list and quick access (up to 20 pinned games), under /api/currentuser/tracked. */
@Injectable({ providedIn: 'root' })
export class TrackingApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_ENV).apiBaseUrl}/api/currentuser/tracked`;

  /** Every tracked game, newest release first. */
  list(): Observable<TrackedGame[]> {
    return this.http.get<TrackedGamesResponse>(this.url).pipe(map((r) => r.games));
  }

  /** Adds the game, or changes its status. */
  track(gameId: number, status: TrackingStatus): Observable<TrackedGame> {
    return this.http.put<TrackedGame>(`${this.url}/${gameId}`, { status });
  }

  untrack(gameId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${gameId}`);
  }

  /** Pinned games in their order. */
  quickAccess(): Observable<TrackedGame[]> {
    return this.http.get<TrackedGamesResponse>(`${this.url}/quick-access`).pipe(map((r) => r.games));
  }

  /** Pins at the end; 409 quick_access_full at 20. Returns quick access in its new order. */
  pin(gameId: number): Observable<TrackedGame[]> {
    return this.http.put<TrackedGamesResponse>(`${this.url}/${gameId}/pin`, null).pipe(map((r) => r.games));
  }

  unpin(gameId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${gameId}/pin`);
  }

  /** New order: every pinned game exactly once. */
  reorder(gameIds: number[]): Observable<TrackedGame[]> {
    return this.http.put<TrackedGamesResponse>(`${this.url}/quick-access`, { gameIds }).pipe(map((r) => r.games));
  }
}
