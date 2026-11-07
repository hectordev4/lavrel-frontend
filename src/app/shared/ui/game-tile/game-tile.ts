import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../../core/api/models/game-card.model';
import { GameCover } from '../game-cover/game-cover';
import { gameLink } from '../../utils/game-link';

/** A game in a sideways-scrolling row: big cover, title, release date. */
@Component({
  selector: 'app-game-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, GameCover],
  templateUrl: './game-tile.html',
  styleUrl: './game-tile.scss',
})
export class GameTile {
  readonly game = input.required<GameCard>();

  protected readonly link = computed(() => gameLink(this.game().slug));
}
