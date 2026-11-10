import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../../core/api/models/game-card.model';
import { gameLink } from '../../utils/game-link';
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

  protected readonly link = computed(() => gameLink(this.game().slug));
  protected readonly year = computed(() => this.game().releaseDate?.slice(0, 4) ?? null);
  protected readonly systems = computed(() => (this.game().availableOn ?? []).join(' · '));
}
