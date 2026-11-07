import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { GameDetails } from '../models/game-details.model';

/** The game page's data, by slug (GET /api/games/slug/{slug}) or id. Public; 404 when the game isn't published. */
@Injectable({ providedIn: 'root' })
export class GameDetailsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  bySlug(slug: string): Observable<GameDetails> {
    return this.http.get<GameDetails>(`${this.base}/api/games/slug/${encodeURIComponent(slug)}`);
  }

  get(id: number): Observable<GameDetails> {
    return this.http.get<GameDetails>(`${this.base}/api/games/${id}`);
  }
}
