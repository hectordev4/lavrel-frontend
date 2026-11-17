import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { gameLink } from '../../../../shared/utils/game-link';
import { Modal } from '../../../../shared/ui/modal/modal';
import { GuideConversation } from '../../data-access/guide-conversation';
import { MAX_QUESTION_LENGTH, SHOW_COUNT_FROM } from '../../data-access/question-limit';
import { GuideAnswer } from '../../ui/guide-answer/guide-answer';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';

/**
 * /assistant/guide/:gameId/:achievementId?name=…&game=…&slug=…&hidden=1 — the chat about one achievement.
 * It opens with the spoiler choice, then the guide, then follow-up questions. Nothing is kept after leaving.
 */
@Component({
  selector: 'app-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, RouterLink, Modal, GuideAnswer],
  providers: [GuideConversation],
  templateUrl: './guide.page.html',
  styleUrl: './guide.page.scss',
})
export class GuidePage {
  protected readonly convo = inject(GuideConversation);
  private readonly route = inject(ActivatedRoute).snapshot;

  protected readonly name = this.route.queryParamMap.get('name') ?? 'This achievement';
  protected readonly gameTitle = this.route.queryParamMap.get('game') ?? '';
  protected readonly hidden = this.route.queryParamMap.get('hidden') === '1';
  private readonly slug = this.route.queryParamMap.get('slug');
  protected readonly backLink = this.slug ? gameLink(this.slug) : '/assistant';
  protected readonly lastIsAnswer = computed(
    () => this.convo.messages().at(-1)?.role === 'assistant',
  );

  constructor() {
    const gameId = Number(this.route.paramMap.get('gameId'));
    const achievementId = Number(this.route.paramMap.get('achievementId'));
    this.convo.open(gameId, achievementId);
  }

  protected readonly maxQuestion = MAX_QUESTION_LENGTH;
  protected readonly showCountFrom = SHOW_COUNT_FROM;
  /** Characters in the box, for the "x / 500" counter. */
  protected readonly typed = signal(0);

  protected send(input: HTMLTextAreaElement): void {
    const text = input.value;
    // While an answer is on its way the question waits in the box instead of being dropped.
    if (!text.trim() || this.convo.status() === 'answering') return;
    input.value = '';
    this.typed.set(0);
    void this.ask(text, input);
  }

  /** Asks, and puts a question whose request failed back in the box (unless something new was typed there). */
  private async ask(text: string, input: HTMLTextAreaElement): Promise<void> {
    const back = await this.convo.ask(text);
    if (back !== null && !input.value.trim()) {
      input.value = back;
      this.typed.set(back.length);
    }
  }

  protected onKey(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send(input);
    }
  }
}
