import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackedGame } from '../../../../core/api/models/tracked-game.model';
import { TrackingStatus } from '../../../../core/api/models/tracking-status.model';
import { TRACKING_STATUSES, TRACKING_STATUS_LABELS } from '../../../../core/tracking/tracking-labels';
import { MAX_PINNED, TrackedGames } from '../../../../core/tracking/tracked-games';
import { Chip } from '../../../../shared/ui/chip/chip';
import { SORT_LABELS, filterAndSort } from '../../data-access/tracked-list';
import { StatusFilter } from '../../models/status-filter.model';
import { TrackedSort } from '../../models/tracked-sort.model';
import { TrackedCard } from '../../ui/tracked-card/tracked-card';

/** The Games tab for members: the tracking list with status filters, sort and pins. */
@Component({
  selector: 'app-games-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Chip, TrackedCard],
  templateUrl: './games.page.html',
  styleUrl: './games.page.scss',
})
export class GamesPage {
  protected readonly tracked = inject(TrackedGames);
  protected readonly status = signal<StatusFilter>('ALL');
  protected readonly sort = signal<TrackedSort>('release');
  protected readonly message = signal<string | null>(null);
  protected readonly maxPinned = MAX_PINNED;

  protected readonly statusChips = computed(() => {
    const games = this.tracked.games();
    return [
      { value: 'ALL' as StatusFilter, label: 'All', count: games.length },
      ...TRACKING_STATUSES.map((s) => ({
        value: s as StatusFilter,
        label: TRACKING_STATUS_LABELS[s],
        count: games.filter((g) => g.status === s).length,
      })),
    ];
  });
  protected readonly sortOptions = (Object.keys(SORT_LABELS) as TrackedSort[]).map((value) => ({
    value,
    label: SORT_LABELS[value],
  }));
  protected readonly visible = computed(() => filterAndSort(this.tracked.games(), this.status(), this.sort()));

  constructor() {
    this.tracked.ensureLoaded();
  }

  protected async changeStatus(game: TrackedGame, status: TrackingStatus): Promise<void> {
    this.message.set(await this.tracked.track(game.gameId, status));
  }

  protected async togglePin(game: TrackedGame): Promise<void> {
    this.message.set(
      game.pinPosition === null ? await this.tracked.pin(game.gameId) : await this.tracked.unpin(game.gameId),
    );
  }

  protected async remove(game: TrackedGame): Promise<void> {
    if (!confirm(`Remove ${game.title} from your tracking list?`)) return;
    this.message.set(await this.tracked.untrack(game.gameId));
  }
}
