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
  /** New answers left today; null when unknown or unlimited (see unlimited). */
  readonly left = computed(() => {
    const u = this.usage();
    return u && !u.unlimited && u.dailyLimit !== null ? Math.max(0, u.dailyLimit - u.usedToday) : null;
  });
  readonly unlimited = computed(() => this.usage()?.unlimited === true);

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

  /**
   * A follow-up question. Resolves to null once answered (or ignored), and to the question's text when the request
   * failed: the unanswered question leaves the thread, and the page puts it back in the box.
   */
  async ask(question: string): Promise<string | null> {
    const text = question.trim();
    if (!text || this.status() === 'answering' || this.spoilers() === null) return null;
    const before = this.messages();
    this.messages.set([...before, { role: 'user', text }]);
    const answered = await this.request(() =>
      this.api.ask(this.gameId, this.achievementId, text, this.spoilers()!, this.lang),
    );
    if (answered) return null;
    this.messages.set(before);
    return text;
  }

  /** True once the request got an answer (a guide, or the consent question); false when it failed. */
  private async request(call: () => ReturnType<AssistantApi['guide']>): Promise<boolean> {
    this.status.set('answering');
    this.error.set(null);
    try {
      const answer = await firstValueFrom(call());
      if (answer.status === 'SPOILER_CONSENT_REQUIRED') {
        this.status.set('consent');
        return true;
      }
      this.messages.update((m) => [...m, toMessage(answer)]);
      this.status.set('ready');
      if (!answer.saved) void this.refreshUsage();
      return true;
    } catch (error) {
      this.error.set(assistantErrorMessage(error));
      this.status.set('failed');
      return false;
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

export function toMessage(answer: GuideAnswer): GuideMessage {
  const text = answer.text ?? '';
  return {
    role: 'assistant',
    text,
    html: renderMarkdown(text),
    grounded: answer.grounded,
    curated: answer.curated === true,
    sources: answer.sources ?? [],
  };
}
