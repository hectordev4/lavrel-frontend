import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { isRare } from '../../../../shared/utils/rarity';
import { gameLink } from '../../../../shared/utils/game-link';
import { shelfTitle } from '../../data-access/shelf-labels';
import { Shelf as ShelfModel } from '../../models/public-profile.model';

/** One shelf of a public profile: a row of games, a list of achievements, or the stats. */
@Component({
  selector: 'app-shelf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, GameCover],
  templateUrl: './shelf.html',
  styleUrl: './shelf.scss',
})
export class Shelf {
  readonly shelf = input.required<ShelfModel>();

  protected readonly title = computed(() => shelfTitle(this.shelf()));
  protected readonly gameLink = gameLink;
  protected readonly isRare = isRare;
}
