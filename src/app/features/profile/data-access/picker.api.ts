import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { AchievementGamePage, UnlockedAchievement } from '../models/achievement-game.model';

export type PickerGameSort = 'recent' | 'name';
export type PickerAchievementSort = 'rarity' | 'date';

/** What the achievements picker browses: my games with unlocks, then my unlocks in one game. */
@Injectable({ providedIn: 'root' })
export class PickerApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  /** Only games with at least one unlock; q like search (case and accents ignored); 24 per page. */
  games(q: string, sort: PickerGameSort, page: number, size = 24): Observable<AchievementGamePage> {
    let params = new HttpParams().set('sort', sort).set('page', page).set('size', size);
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<AchievementGamePage>(`${this.base}/api/currentuser/achievements/games`, {
      params,
    });
  }

  /** rarity: rarest first (no data last); date: newest unlock first. */
  unlocked(
    gameId: number,
    sort: PickerAchievementSort,
  ): Observable<{ gameId: number; achievements: UnlockedAchievement[] }> {
    return this.http.get<{ gameId: number; achievements: UnlockedAchievement[] }>(
      `${this.base}/api/currentuser/games/${gameId}/achievements/unlocked`,
      { params: new HttpParams().set('sort', sort) },
    );
  }
}
