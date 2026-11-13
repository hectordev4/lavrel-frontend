import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameGenre, GameTag } from '../../models/game-details.model';

const SHORT_TAGS = 8;

/** Tags (each opens search filtered by it; the first 8, then all) and genres. */
@Component({
  selector: 'app-game-labels',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (tags().length || genres().length) {
      <section class="labels">
        @if (tags().length) {
          <h2>Tags</h2>
          <ul class="pills">
            @for (tag of shown(); track tag.id) {
              <li>
                <a routerLink="/search/results" [queryParams]="{ tag: tag.id + ':' + tag.name }">{{
                  tag.name
                }}</a>
              </li>
            }
          </ul>
          @if (tags().length > shortTagCount) {
            <button type="button" class="link-btn" (click)="allTags.set(!allTags())">
              {{ allTags() ? 'Fewer tags' : 'All ' + tags().length + ' tags' }}
            </button>
          }
        }
        @if (genres().length) {
          <h3>Genres</h3>
          <ul class="pills">
            @for (genre of genres(); track genre.id) {
              <li>
                <span>{{ genre.name }}</span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
  styleUrl: './game-labels.scss',
})
export class GameLabels {
  readonly tags = input<GameTag[]>([]);
  readonly genres = input<GameGenre[]>([]);
  protected readonly allTags = signal(false);
  protected readonly shortTagCount = SHORT_TAGS;
  protected readonly shown = computed(() =>
    this.allTags() ? this.tags() : this.tags().slice(0, SHORT_TAGS),
  );
}
