import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssistantUsage } from '../models/assistant-usage.model';
import { ChatTurn } from '../models/chat-turn.model';
import { GuideMessage } from '../models/guide-message.model';
import { AssistantApi } from './assistant.api';
import { assistantErrorMessage } from './assistant-messages';
import { toMessage } from './guide-conversation';
import { systemLanguage } from './system-language';

/** The backend accepts up to 40 messages and reads the last 12. */
const MAX_SENT = 40;

/**
 * An open chat about one game while the screen is open (never stored): the frontend keeps the conversation and
 * sends it with each question.
 */
@Injectable()
export class GameChat {
  private readonly api = inject(AssistantApi);
  private readonly lang = systemLanguage();
  private gameId = 0;

  readonly messages = signal<GuideMessage[]>([]);
  readonly answering = signal(false);
  readonly error = signal<string | null>(null);
  readonly usage = signal<AssistantUsage | null>(null);
  readonly left = computed(() => {
    const u = this.usage();
    return u && !u.unlimited && u.dailyLimit !== null ? Math.max(0, u.dailyLimit - u.usedToday) : null;
  });
  readonly unlimited = computed(() => this.usage()?.unlimited === true);

  open(gameId: number): void {
    this.gameId = gameId;
    void this.refreshUsage();
  }

  async send(question: string): Promise<void> {
    const text = question.trim();
    if (!text || this.answering()) return;
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.answering.set(true);
    this.error.set(null);
    try {
      const answer = await firstValueFrom(this.api.chat(this.gameId, this.turns(), this.lang));
      this.messages.update((m) => [...m, toMessage(answer)]);
      void this.refreshUsage();
    } catch (error) {
      this.error.set(assistantErrorMessage(error));
    } finally {
      this.answering.set(false);
    }
  }

  private turns(): ChatTurn[] {
    return this.messages()
      .map((m): ChatTurn => ({ role: m.role, content: m.text }))
      .slice(-MAX_SENT);
  }

  private async refreshUsage(): Promise<void> {
    try {
      this.usage.set(await firstValueFrom(this.api.usage()));
    } catch {
      // The allowance line just stays hidden.
    }
  }
}
