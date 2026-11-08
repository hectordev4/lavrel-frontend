import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssistantUsage } from '../models/assistant-usage.model';
import { GuideAnswer } from '../models/guide-answer.model';
import { GuideMessage } from '../models/guide-message.model';
import { GuideStatus } from '../models/guide-status.model';
import { AssistantApi } from './assistant.api';
import { assistantErrorMessage } from './assistant-messages';
import { renderMarkdown } from './markdown';
import { systemLanguage } from './system-language';

/**
 * One guide conversation about one achievement: the spoiler choice (asked once per conversation), the first
 * guide, follow-up questions and today's allowance. Lives only as long as the screen; nothing is stored.
 */
@Injectable()
export class GuideConversation {
  private readonly api = inject(AssistantApi);
  private readonly lang = systemLanguage();
  private gameId = 0;
  private achievementId = 0;

  readonly status = signal<GuideStatus>('choosing');
  readonly spoilers = signal<boolean | null>(null);
  readonly messages = signal<GuideMessage[]>([]);
  readonly error = signal<string | null>(null);
  readonly usage = signal<AssistantUsage | null>(null);
  readonly left = computed(() => {
    const u = this.usage();
    return u ? Math.max(0, u.dailyLimit - u.usedToday) : null;
  });

  open(gameId: number, achievementId: number): void {
    this.gameId = gameId;
    this.achievementId = achievementId;
    void this.refreshUsage();
  }

  /** The spoiler choice, then the first guide. */
  async start(spoilers: boolean): Promise<void> {
    this.spoilers.set(spoilers);
    await this.request(() => this.api.guide(this.gameId, this.achievementId, spoilers, this.lang));
  }

  async ask(question: string): Promise<void> {
    const text = question.trim();
    if (!text || this.status() === 'answering' || this.spoilers() === null) return;
    this.messages.update((m) => [...m, { role: 'user', text }]);
    await this.request(() => this.api.ask(this.gameId, this.achievementId, text, this.spoilers()!, this.lang));
  }

  private async request(call: () => ReturnType<AssistantApi['guide']>): Promise<void> {
    this.status.set('answering');
    this.error.set(null);
    try {
      const answer = await firstValueFrom(call());
      if (answer.status === 'SPOILER_CONSENT_REQUIRED') {
        this.status.set('consent');
        return;
      }
      this.messages.update((m) => [...m, toMessage(answer)]);
      this.status.set('ready');
      if (!answer.saved) void this.refreshUsage();
    } catch (error) {
      this.error.set(assistantErrorMessage(error));
      this.status.set('failed');
    }
  }

  private async refreshUsage(): Promise<void> {
    try {
      this.usage.set(await firstValueFrom(this.api.usage()));
    } catch {
      // The allowance line just stays hidden.
    }
  }
}

function toMessage(answer: GuideAnswer): GuideMessage {
  return { role: 'assistant', html: renderMarkdown(answer.text ?? ''), grounded: answer.grounded, sources: answer.sources ?? [] };
}
