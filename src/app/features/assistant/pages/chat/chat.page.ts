import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { gameLink } from '../../../../shared/utils/game-link';
import { GameChat } from '../../data-access/game-chat';
import { GuideAnswer } from '../../ui/guide-answer/guide-answer';

/** Ideas to start with when the chat is empty. */
const STARTERS = ['Where should I start?', 'Which achievements are missable?', 'Tips for the hardest achievements'];

/**
 * /assistant/chat/:gameId?game=…&slug=… — talk freely with the AI about one game. Answers keep their sources at
 * the bottom; the backend keeps spoilers out of the open chat. Nothing is kept after leaving.
 */
@Component({
  selector: 'app-chat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GuideAnswer],
  providers: [GameChat],
  templateUrl: './chat.page.html',
  styleUrls: ['../guide/guide.page.scss', './chat.page.scss'],
})
export class ChatPage {
  protected readonly chat = inject(GameChat);
  private readonly route = inject(ActivatedRoute).snapshot;

  protected readonly gameTitle = this.route.queryParamMap.get('game') ?? 'this game';
  private readonly slug = this.route.queryParamMap.get('slug');
  protected readonly backLink = this.slug ? gameLink(this.slug) : '/assistant';
  protected readonly starters = STARTERS;
  protected readonly lastIsAnswer = computed(() => this.chat.messages().at(-1)?.role === 'assistant');

  constructor() {
    this.chat.open(Number(this.route.paramMap.get('gameId')));
  }

  protected send(input: HTMLTextAreaElement): void {
    const text = input.value;
    if (!text.trim()) return;
    input.value = '';
    void this.chat.send(text);
  }

  protected onKey(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send(input);
    }
  }
}
