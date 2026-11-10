import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_ENV } from '../../../core/config/app-env.token';
import { AssistantUsage } from '../models/assistant-usage.model';
import { ChatTurn } from '../models/chat-turn.model';
import { GuideAnswer } from '../models/guide-answer.model';

/** The assistant's achievement guides. Members only; answers are Markdown. */
@Injectable({ providedIn: 'root' })
export class AssistantApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_ENV).apiBaseUrl;

  /** How to get it: a saved guide (free) or a new one (counted). */
  guide(gameId: number, achievementId: number, spoilers: boolean, lang: string): Observable<GuideAnswer> {
    const params = new HttpParams().set('spoilers', spoilers).set('lang', lang);
    return this.http.get<GuideAnswer>(this.url(gameId, achievementId), { params });
  }

  /** A follow-up question: always a new answer (counted), never saved. */
  ask(gameId: number, achievementId: number, question: string, spoilers: boolean, lang: string): Observable<GuideAnswer> {
    return this.http.post<GuideAnswer>(`${this.url(gameId, achievementId)}/questions`, { question, spoilers, lang });
  }

  /**
   * Open chat about a game: the whole conversation so far, oldest first, ending with the new question (the backend
   * reads the last 12). Counts like a follow-up; nothing is stored.
   */
  chat(gameId: number, messages: ChatTurn[], lang: string): Observable<GuideAnswer> {
    return this.http.post<GuideAnswer>(`${this.base}/api/games/${gameId}/chat`, { messages, lang });
  }

  usage(): Observable<AssistantUsage> {
    return this.http.get<AssistantUsage>(`${this.base}/api/currentuser/assistant/usage`);
  }

  private url(gameId: number, achievementId: number): string {
    return `${this.base}/api/games/${gameId}/achievements/${achievementId}/guide`;
  }
}
