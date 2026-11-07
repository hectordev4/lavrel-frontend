import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../../core/api/models/game-card.model';
import { GameCover } from '../game-cover/game-cover';

/** A game in a vertical list: cover, title, year, rating and the systems it is on. */
@Component({
  selector: 'app-game-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover],
  templateUrl: './game-row.html',
  styleUrl: './game-row.scss',
})
export class GameRow {
  readonly game = input.required<GameCard>();

  protected readonly link = computed(() => gameLink(this.game()));
  protected readonly year = computed(() => this.game().releaseDate?.slice(0, 4) ?? null);
  protected readonly systems = computed(() => (this.game().availableOn ?? []).join(' · '));
}

/** Game page address: /games/{id}-{slug}; only the id identifies the game. */
export function gameLink(game: Pick<GameCard, 'id' | 'slug'>): string {
  return game.slug ? `/games/${game.id}-${game.slug}` : `/games/${game.id}`;
}
