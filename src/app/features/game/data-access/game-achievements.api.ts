import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { GameAchievements } from '../models/game-achievements.model';

/**
 * GET /api/games/{id}/achievements: public. Signed in (the interceptor adds the token), each achievement
 * also says whether you unlocked it and when, plus the percentage in your country.
 */
@Injectable({ providedIn: 'root' })
export class GameAchievementsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  list(gameId: number): Observable<GameAchievements> {
    return this.http.get<GameAchievements>(`${this.base}/api/games/${gameId}/achievements`);
  }
}
