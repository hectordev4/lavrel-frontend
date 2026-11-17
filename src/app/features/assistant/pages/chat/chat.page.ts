import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameChat } from '../../data-access/game-chat';
import { MAX_QUESTION_LENGTH, SHOW_COUNT_FROM } from '../../data-access/question-limit';
import { GuideAnswer } from '../../ui/guide-answer/guide-answer';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';

/** Ideas to start with when the chat is empty. */
const STARTERS = [
  'Where should I start?',
  'Which achievements are missable?',
  'Tips for the hardest achievements',
];

/**
 * /assistant/chat/:gameId?game=…&slug=… — talk freely with the AI about one game. Answers keep their sources at
 * the bottom; the backend keeps spoilers out of the open chat. Nothing is kept after leaving.
 */
@Component({
  selector: 'app-chat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, GuideAnswer],
  providers: [GameChat],
  templateUrl: './chat.page.html',
  styleUrls: ['../guide/guide.page.scss', './chat.page.scss'],
})
export class ChatPage {
  protected readonly chat = inject(GameChat);
  private readonly route = inject(ActivatedRoute).snapshot;

  protected readonly gameTitle = this.route.queryParamMap.get('game') ?? 'this game';
  /** Back always returns to the AI tab, where you pick the next game to talk about. */
  protected readonly backLink = '/assistant';
  protected readonly starters = STARTERS;
  protected readonly lastIsAnswer = computed(
    () => this.chat.messages().at(-1)?.role === 'assistant',
  );

  constructor() {
    this.chat.open(Number(this.route.paramMap.get('gameId')));
  }

  protected readonly maxQuestion = MAX_QUESTION_LENGTH;
  protected readonly showCountFrom = SHOW_COUNT_FROM;
  /** Characters in the box, for the "x / 500" counter. */
  protected readonly typed = signal(0);

  protected send(input: HTMLTextAreaElement): void {
    const text = input.value;
    // While an answer is on its way the question waits in the box instead of being dropped.
    if (!text.trim() || this.chat.answering()) return;
    input.value = '';
    this.typed.set(0);
    void this.ask(text, input);
  }

  /** Asks, and puts a question whose request failed back in the box (unless something new was typed there). */
  protected async ask(text: string, input: HTMLTextAreaElement): Promise<void> {
    const back = await this.chat.send(text);
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
