import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackedGames } from '../../../../core/tracking/tracked-games';
import { CtaCard } from '../../../../shared/ui/cta-card/cta-card';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { ChatGamePicker } from '../../data-access/chat-game-picker';

/** The AI tab: pick a game to chat about (your games first, or search), and how to get achievement guides. */
@Component({
  selector: 'app-assistant-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CtaCard, GameCover],
  providers: [ChatGamePicker],
  templateUrl: './assistant.page.html',
  styleUrl: './assistant.page.scss',
})
export class AssistantPage {
  protected readonly picker = inject(ChatGamePicker);
  private readonly tracked = inject(TrackedGames);

  /** Pinned games first, then the rest marked Playing; up to 6. */
  protected readonly yourGames = computed(() => {
    const pinned = this.tracked.pinned();
    const playing = this.tracked.games().filter((g) => g.status === 'PLAYING' && g.pinPosition === null);
    return [...pinned, ...playing].slice(0, 6).map((g) => ({ id: g.gameId, title: g.title, slug: g.slug, cover: g.coverImageUrl }));
  });

  constructor() {
    this.tracked.ensureLoaded();
  }
}
