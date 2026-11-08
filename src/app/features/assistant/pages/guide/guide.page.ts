import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { gameLink } from '../../../../shared/utils/game-link';
import { Modal } from '../../../../shared/ui/modal/modal';
import { GuideConversation } from '../../data-access/guide-conversation';
import { GuideAnswer } from '../../ui/guide-answer/guide-answer';

/**
 * /assistant/guide/:gameId/:achievementId?name=…&game=…&slug=…&hidden=1 — the chat about one achievement.
 * It opens with the spoiler choice, then the guide, then follow-up questions. Nothing is kept after leaving.
 */
@Component({
  selector: 'app-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Modal, GuideAnswer],
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
  protected readonly lastIsAnswer = computed(() => this.convo.messages().at(-1)?.role === 'assistant');

  constructor() {
    const gameId = Number(this.route.paramMap.get('gameId'));
    const achievementId = Number(this.route.paramMap.get('achievementId'));
    this.convo.open(gameId, achievementId);
  }

  protected send(input: HTMLTextAreaElement): void {
    const text = input.value;
    if (!text.trim()) return;
    input.value = '';
    void this.convo.ask(text);
  }

  protected onKey(event: KeyboardEvent, input: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send(input);
    }
  }
}
