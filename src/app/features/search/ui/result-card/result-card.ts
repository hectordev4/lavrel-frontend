import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCard } from '../../../../core/api/models/game-card.model';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { gameLink } from '../../../../shared/ui/game-row/game-row';
import { MODE_LABELS, SYSTEM_LABELS } from '../../data-access/search-labels';

/** A search result: cover, title, year and modes, rating, systems and top tags. */
@Component({
  selector: 'app-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, GameCover],
  templateUrl: './result-card.html',
  styleUrl: './result-card.scss',
})
export class ResultCard {
  readonly game = input.required<GameCard>();

  protected readonly link = computed(() => gameLink(this.game()));
  protected readonly year = computed(() => this.game().releaseDate?.slice(0, 4) ?? null);
  protected readonly modes = computed(() => {
    const m = this.game().modes;
    if (!m) return '';
    const list = [m.singlePlayer && MODE_LABELS['single-player'], m.coOp && MODE_LABELS['co-op'], m.multiplayer && MODE_LABELS.multiplayer];
    return list.filter(Boolean).join(', ');
  });
  protected readonly systems = computed(() => (this.game().availableOn ?? []).map((s) => SYSTEM_LABELS[s]).join(' · '));
}
