import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { gameLink } from '../../../../shared/utils/game-link';
import { QuickResults } from '../../models/quick-results.model';

/** Grouped type-ahead results: games open their page, tags and franchises open filtered results. */
@Component({
  selector: 'app-suggestion-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover],
  templateUrl: './suggestion-list.html',
  styleUrl: './suggestion-list.scss',
})
export class SuggestionList {
  readonly results = input.required<QuickResults>();

  protected readonly empty = computed(() => {
    const r = this.results();
    return r.games.length + r.tags.length + r.franchises.length === 0;
  });
  protected readonly gameLink = gameLink;

  /** Filters travel in the address as "id:name" so the results page can label its chips. */
  protected filterValue(id: number, name: string): string {
    return `${id}:${name}`;
  }
}
