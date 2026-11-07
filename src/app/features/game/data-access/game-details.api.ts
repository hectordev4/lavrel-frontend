import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { GameDetails } from '../models/game-details.model';

/** GET /api/games/{id}: public; 404 when the game isn't published. */
@Injectable({ providedIn: 'root' })
export class GameDetailsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  get(id: number): Observable<GameDetails> {
    return this.http.get<GameDetails>(`${this.base}/api/games/${id}`);
  }
}
