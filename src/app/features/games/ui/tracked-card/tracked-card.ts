import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackedGame } from '../../../../core/api/models/tracked-game.model';
import { TrackingStatus } from '../../../../core/api/models/tracking-status.model';
import { TRACKING_STATUSES, TRACKING_STATUS_LABELS } from '../../../../core/tracking/tracking-labels';
import { GameCover } from '../../../../shared/ui/game-cover/game-cover';
import { PerfectDiamond } from '../../../../shared/ui/perfect-diamond/perfect-diamond';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { progressPercent } from '../../../../shared/ui/progress-bar/progress-tier';
import { gameLink } from '../../../../shared/utils/game-link';

/** A tracked game: status, pin, progress and the easiest achievements left. */
@Component({
  selector: 'app-tracked-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameCover, PerfectDiamond, ProgressBar],
  templateUrl: './tracked-card.html',
  styleUrl: './tracked-card.scss',
})
export class TrackedCard {
  readonly game = input.required<TrackedGame>();
  readonly busy = input(false);
  readonly statusChange = output<TrackingStatus>();
  readonly pinToggle = output<void>();
  readonly remove = output<void>();

  protected readonly statuses = TRACKING_STATUSES.map((value) => ({ value, label: TRACKING_STATUS_LABELS[value] }));
  protected readonly revealed = signal<ReadonlySet<number>>(new Set());
  protected readonly link = computed(() => gameLink(this.game().slug));
  protected readonly percent = computed(() => progressPercent(this.game().unlocked, this.game().total));
  protected readonly pinned = computed(() => this.game().pinPosition !== null);

  protected reveal(id: number): void {
    this.revealed.update((ids) => new Set([...ids, id]));
  }

  protected onStatus(value: string): void {
    this.statusChange.emit(value as TrackingStatus);
  }
}
